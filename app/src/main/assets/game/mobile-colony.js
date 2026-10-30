// View pagination only; original nodes, handlers, ordering and game values remain authoritative (Research rows: the
// affordable-first display order of mobile-research-order.js, V-178).
var ColonyPages = (() => {
    function splitPages(heights, budget, minimumRows = 1, columns = 1) {
        const pages = [[]]; let used = 0;
        for (let index = 0; index < heights.length; index += columns) {
            const height = Math.max(...heights.slice(index, index + columns));
            if (used + height > budget && pages[pages.length - 1].length >= minimumRows) { pages.push([]); used = 0; }
            for (let c = index; c < Math.min(index + columns, heights.length); c++) pages[pages.length - 1].push(c);
            used += height;
        }
        return pages;
    }
    function create(host) {
        const byId = id => document.getElementById(id);
        let selected = 'resources', page = 0, active = true, scheduled = false, detailNode = null, detailMarker = null;
        const summary = document.createElement('div'); summary.id = 'mobile-resource-summary';
        for (const [resource, label] of [['food','Food'],['wood','Wood'],['metal','Metal'],['science','Science']]) {
            const item = document.createElement('div'); item.dataset.resource = resource;
            item.innerHTML = '<span>' + label + '</span><strong></strong>'; summary.appendChild(item);
        }
        const content = document.createElement('div'); content.id = 'mobile-colony-content';
        const resources = document.createElement('div'); resources.id = 'mobile-colony-resources';
        const resourceColumn = byId('resourceColumn');
        const block = document.createElement('div'); block.id = 'mobile-resource-block';
        block.append(resourceColumn, byId('miscColumn')); resources.append(block);
        // Empty desktop columns are retained; gather nodes become independent, readable rows.
        const gatherNodes = [...resourceColumn.querySelectorAll('.playerGather')];
        [...resourceColumn.children].forEach(node => node.classList.add('mobile-desktop-resource-shell'));
        gatherNodes.forEach(node => resourceColumn.appendChild(node));
        const actions = document.createElement('div'); actions.id = 'mobile-resource-actions';
        actions.setAttribute('role','group'); actions.setAttribute('aria-label','Gather a resource');
        for (const [key,label] of [['food','Gather'],['wood','Chop'],['metal','Mine'],['science','Research']]) {
            const control = resources.querySelector('#' + key + 'CollectBtn');
            control.dataset.resource = key; control.dataset.actionLabel = label;
            control.addEventListener('click',requestRefresh);
            actions.appendChild(control);
        }
        resources.prepend(actions);
        const population = byId('trimpsColumn'), buy = byId('buyCol');
        content.append(resources, population, buy);
        const turkimp = population.querySelector('#turkimpBuff'), turkimpTime = turkimp.querySelector('#turkimpTime');
        turkimp.onmouseover = null; turkimp.onmouseout = null;
        const turkimpSymbol = document.createElement('span'); turkimpSymbol.className = 'mobile-turkimp-symbol'; turkimpSymbol.setAttribute('aria-hidden','true');
        const turkimpText = document.createElement('div'); turkimpText.className = 'mobile-turkimp-text';
        const turkimpTitle = document.createElement('strong'), turkimpEffect = document.createElement('small');
        const turkimpPermanent = document.createElement('span'); turkimpPermanent.className = 'mobile-turkimp-permanent'; turkimpPermanent.textContent = 'permanent'; turkimpPermanent.hidden = true;
        turkimpText.append(turkimpTitle,turkimpEffect);
        turkimp.replaceChildren(turkimpSymbol,turkimpText,turkimpTime,turkimpPermanent); content.prepend(turkimp);
        const empty = document.createElement('p'); empty.id = 'mobile-colony-empty'; empty.textContent = MobileTexts.colonyEmpty;
        const pager = document.createElement('div'); pager.id = 'mobile-colony-pager';
        const previous = document.createElement('button'); previous.id = 'mobile-colony-prev'; previous.textContent = MobileTexts.previous;
        const counter = document.createElement('span'); counter.setAttribute('aria-live','polite');
        const next = document.createElement('button'); next.id = 'mobile-colony-next'; next.textContent = MobileTexts.next;
        pager.append(previous, counter, next); content.append(empty, pager); host.prepend(summary, content);
        const detail = document.createElement('section'); detail.id = 'mobile-colony-detail'; detail.hidden = true;
        const detailClose = document.createElement('button'); detailClose.textContent = MobileTexts.close;
        const detailBody = document.createElement('div'); detail.append(detailClose, detailBody); document.body.appendChild(detail);
        function restoreDetail() {
            if (detail.hidden) return false;
            detailMarker.replaceWith(detailNode); detailNode = detailMarker = null; detail.hidden = true;
            return true;
        }
        function closeDetail() {
            if (!restoreDetail()) return false;
            filterTabs(selected === 'resources' ? 'upgrades' : selected); requestRefresh(); return true;
        }
        function openDetail(name) {
            if (!['talents','nature'].includes(name)) return;
            restoreDetail();
            detailNode = byId(name + 'Container'); detailMarker = document.createComment('colony-detail-position');
            detailNode.before(detailMarker); detailBody.appendChild(detailNode); detail.hidden = false;
        }
        detailClose.onclick = closeDetail;
        function select(name) {
            if (!MobileTexts.colonyTabs.some(([key]) => key === name)) return;
            cancelTooltip(); closeDetail(); selected = name; page = 0;
            MobileInventory.select(name);
            if (name === 'upgrades' && typeof MobileResearchOrder !== 'undefined') MobileResearchOrder.sort();
            resources.hidden = name !== 'resources'; population.hidden = name !== 'jobs'; buy.hidden = name === 'resources';
            byId('queueContainer').hidden = name !== 'buildings'; byId('buyTabsUl').hidden = true;
            byId('buyTabsUl2').hidden = name !== 'upgrades';
            if (name !== 'resources') filterTabs(name);
            if (typeof TrimpsUI !== 'undefined' && TrimpsUI) TrimpsUI.syncNavigation();
            content.dataset.category = name; byId('mobile-colony').dataset.category = name; window.scrollTo(0,0); requestRefresh();
        }
        function rows() {
            return selected === 'resources' ? [...resources.querySelectorAll('.playerGather')] : [...byId(selected + 'Here').children];
        }
        function refresh() {
            if (!active || !detail.hidden || host.hidden || u2Mutations.open) return;
            for (const control of actions.children) {
                const source = byId(control.dataset.resource);
                // Check the engine's own unlock flags, independent of view pagination/hidden parents.
                control.hidden = source.style.visibility === 'hidden' || source.style.display === 'none';
                control.setAttribute('aria-pressed', String(game.global.playerGathering === control.dataset.resource));
                control.setAttribute('aria-label', control.dataset.actionLabel + ' · ' + source.querySelector('.title').textContent);
            }
            const permanent = game.talents.turkimp2.purchased;
            turkimpTitle.textContent = 'Turkimp · +' + (permanent ? 100 : 50) + ' %';
            const gathering = ['food','wood','metal'].includes(game.global.playerGathering);
            turkimpEffect.textContent = gathering ? 'Worker bonus: ' + byId(game.global.playerGathering).querySelector('.title').textContent : 'While gathering Food, Wood or Metal';
            turkimpTime.hidden = !!permanent; turkimpPermanent.hidden = !permanent;
            turkimpTime.setAttribute('aria-label', permanent ? 'Permanent bonus' : 'Time remaining');
            // Original load/import may restore another buy filter; this view owns only its presentation.
            if (selected !== 'resources' && game.global.buyTab !== selected) filterTabs(selected);
            summary.querySelectorAll('[data-resource]').forEach(item => {
                const source = byId(item.dataset.resource);
                item.hidden = getComputedStyle(source).visibility === 'hidden' || source.style.display === 'none';
                const text = document.createElement('span'); text.innerHTML = prettify(game.resources[item.dataset.resource].owned);
                item.querySelector('strong').textContent = text.textContent;
            });
            content.querySelectorAll('[data-colony-page-hidden]').forEach(node => node.removeAttribute('data-colony-page-hidden'));
            empty.hidden = true; pager.hidden = false;
            const nodes = rows().filter(node => node.getBoundingClientRect().height > 0 && getComputedStyle(node).visibility !== 'hidden');
            const heights = nodes.map(node => node.getBoundingClientRect().height + 8);
            const available = Math.max(120, innerHeight - byId('mobile-nav').getBoundingClientRect().height - (content.getBoundingClientRect().top + scrollY) - 12);
            content.dataset.availableHeight = String(available);
            const columns = ['jobs','buildings','equipment'].includes(selected) ? 2 : 1;
            let listHeight = 0;
            for (let i = 0; i < heights.length; i += columns) listHeight += Math.max(...heights.slice(i, i + columns));
            const overhead = content.getBoundingClientRect().height - listHeight;
            const pages = ['equipment','buildings','upgrades'].includes(selected) ? [nodes.map((_,index) => index)] : splitPages(heights, Math.max(64, 2 * available - overhead - 16), ['buildings','jobs'].includes(selected) ? 10 : 1, columns);
            page = Math.min(page, pages.length - 1);
            const visible = new Set(pages[page]);
            nodes.forEach((node,index) => { if (!visible.has(index)) node.setAttribute('data-colony-page-hidden',''); });
            empty.hidden = nodes.length > 0 || (selected==='upgrades'&&document.getElementById('mobile-equipment-research')?.hidden===false); pager.hidden = pages.length === 1;
            previous.disabled = page === 0; next.disabled = page === pages.length - 1;
            counter.textContent = MobileTexts.page + ' ' + (page + 1) + ' / ' + pages.length;
            content.dataset.pageIndex = String(page); content.dataset.pageCount = String(pages.length);
        }
        function requestRefresh() {
            if (scheduled) return;
            scheduled = true; requestAnimationFrame(() => { scheduled = false; refresh(); });
        }
        function changePage(delta) {
            const position = selected === 'jobs' ? scrollY : 0;
            page = Math.max(0,page+delta); refresh(); window.scrollTo(0,position);
        }
        previous.onclick = () => changePage(-1);
        next.onclick = () => changePage(1);
        const observer = new MutationObserver(requestRefresh);
        for (const name of ['buildings','jobs','upgrades','equipment']) observer.observe(byId(name + 'Here'), {childList:true});
        observer.observe(byId('queueItemsHere'), {childList:true});
        if (typeof MobileResearchOrder !== 'undefined') MobileResearchOrder.attach(byId('upgradesHere'));
        window.addEventListener('resize',requestRefresh);
        select('resources');
        return {select, category:() => selected, refresh:requestRefresh, activate:value => { active = value; if (value) requestRefresh(); }, back:closeDetail, beforeFilter:restoreDetail, openDetail};
    }
    return {splitPages, create};
})();
var TrimpsColony;
if (typeof module !== 'undefined') module.exports = ColonyPages;
