var MobileRoboTrimp = (() => {
    function shriekState(state) {
        if (state.usingShriek) return 'active';
        if (state.roboTrimpCooldown > 0) return 'cooldown';
        if (state.world < 60) return 'locked';
        return state.useShriek ? 'armed' : 'off';
    }

    if (typeof module === 'object') {
        module.exports = { shriekState };
        return;
    }

    const de = document.documentElement.dataset.language === 'de';
    const t = (english, german) => de ? german : english;
    const rewardText = {
        Foremany: t('Speeds up construction.', 'Beschleunigt den Bau.'),
        AutoJobs: t('Automates hiring.', 'Automatisiert die Vergabe von Berufen.'),
        AutoStructure: t('Buys buildings automatically.', 'Kauft Gebäude automatisch.'),
        Geneticistassist: t('Automates geneticists.', 'Steuert Genetiker automatisch.'),
        DoubleBuild: t('Builds two of the same item at once.', 'Baut zwei gleiche Aufträge gleichzeitig.'),
        DecaBuild: t('Builds ten of the same item at once.', 'Baut zehn gleiche Aufträge gleichzeitig.')
    };
    const percent = new Intl.NumberFormat(de ? 'de' : 'en', { style: 'percent', maximumFractionDigits: 1 });
    const info = document.createElement('button');
    info.id = 'mobile-robo-button';
    info.type = 'button';
    info.className = 'mobile-combat-icon';
    info.hidden = true;
    info.setAttribute('aria-label', 'RoboTrimp');
    info.setAttribute('aria-haspopup', 'dialog');
    info.setAttribute('data-original-text', '');
    info.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="7" width="16" height="13" rx="2"/><path d="M12 7V3M2 12v4m20-4v4M8 13h1m6 0h1"/></svg>';
    document.getElementById('mobile-combat-more').after(info);

    const notice = document.createElement('aside');
    notice.id = 'mobile-robo-notice';
    notice.lang = de ? 'de' : 'en';
    notice.hidden = true;
    notice.innerHTML = `<span role="status" data-original-text></span><button type="button" aria-label="${t('Dismiss notice', 'Hinweis schließen')}">×</button>`;
    document.body.append(notice);
    const dialog = document.createElement('dialog');
    dialog.id = 'mobile-robo-info';
    dialog.lang = notice.lang;
    dialog.setAttribute('aria-labelledby', 'mobile-robo-title');
    dialog.innerHTML = `
        <header>
            <img src="mobile-assets/imp-family/Robotrimp.webp" alt="" width="48" height="48">
            <div><h2 id="mobile-robo-title" data-original-text>RoboTrimp</h2><p></p></div>
            <button type="button" aria-label="${t('Close info', 'Info schließen')}">×</button>
        </header>
        <div class="mobile-robo-details">
            <h3>${t('Combat abilities', 'Kampffähigkeiten')}</h3>
            <div class="mobile-robo-ability"><strong>${t('Attack bonus', 'Angriffsbonus')}</strong><b></b>
                <p>${t('Increases your attack all the time.', 'Erhöht dauerhaft deinen Angriff.')}</p></div>
            <div class="mobile-robo-ability"><strong>MagnetoShriek</strong><b></b>
                <p>${t('When armed, weakens the next Improbability or Omnipotrimp from Zone 60. Takes 5 zones to recharge.',
                         'Wenn scharf, schwächt es ab Zone 60 die nächste Improbability oder den nächsten Omnipotrimp. Lädt sich über 5 Zonen wieder auf.')}</p></div>
            <h3>${t('Unlocked Bionic rewards', 'Freigeschaltete Bionic-Boni')}</h3>
            <ul></ul>
        </div>
        <footer><span role="status"></span><button type="button" class="mobile-robo-action"></button></footer>`;
    document.body.append(dialog);

    const dialogLevel = dialog.querySelector('header p');
    const dialogStatus = dialog.querySelector('footer span');
    const rewards = dialog.querySelector('ul');
    const [attack, shriek] = dialog.querySelectorAll('.mobile-robo-ability b');
    const dismiss = notice.querySelector('button');
    const [close, dialogToggle] = dialog.querySelectorAll('button');
    let lastLevel;
    let lastState;
    let lastCooldown;
    let pendingUnlock;

    function watchUnlocks() {
        lastLevel = undefined;
        pendingUnlock = undefined;
        const unlock = game.mapUnlocks.roboTrimp;
        const fire = unlock.fire;
        unlock.fire = function (fromTalent) {
            const level = game.global.roboTrimpLevel;
            const showTooltip = window.tooltip;
            // Replace the Bionic popups only during the original, synchronous map reward.
            window.tooltip = function (...args) {
                const [title, type, action, , , heading] = args;
                if (title === 'confirm' && heading === 'RoboTrimp') return;
                if (title === 'The Geneticistassist' && action === 'update') return;
                if (type === 'customText' && action === 'lock' && Object.hasOwn(game.bwRewards, title)) return;
                return showTooltip.apply(this, args);
            };
            try {
                fire.call(this, fromTalent);
            } finally {
                window.tooltip = showTooltip;
            }
            if (game.global.roboTrimpLevel > level) {
                pendingUnlock = game.global.roboTrimpLevel;
                refresh();
            }
        };
    }

    function refresh() {
        const { roboTrimpLevel: level, roboTrimpCooldown: cooldown, universe } = game.global;
        const visible = universe === 1 && level > 0 && document.body.dataset.mobilePage === 'battle';
        if (info.hidden === visible) info.hidden = !visible;
        if (!visible && dialog.open) dialog.close();
        if (level !== lastLevel && !notice.hidden) notice.hidden = true;
        if (pendingUnlock !== level) pendingUnlock = undefined;
        if (!visible) return;
        const state = shriekState(game.global);
        if (level === lastLevel && state === lastState && cooldown === lastCooldown) return;
        if (level !== lastLevel) {
            dialogLevel.textContent = t(`Level ${level}`, `Stufe ${level}`);
            attack.textContent = '+' + percent.format(0.2 * level);
            shriek.textContent = '−' + percent.format(1 - game.mapUnlocks.roboTrimp.getShriekValue());
            rewards.replaceChildren();
            for (const [name, reward] of Object.entries(game.bwRewards)) {
                if (!bwRewardUnlocked(name)) continue;
                const row = document.createElement('li');
                const label = document.createElement('strong');
                label.textContent = name;
                const detail = document.createElement('span');
                detail.textContent = `${t('Map', 'Karte')} ${reward.requires} · ${rewardText[name] ?? reward.description}`;
                row.append(label, detail);
                rewards.append(row);
            }
        }
        const label = {
            off: t('Off', 'Aus'), armed: t('Armed', 'Scharf'),
            active: t('In effect', 'Wirkt'), cooldown: t('Cooldown', 'Abklingzeit'),
            locked: t('From Zone 60', 'Ab Zone 60')
        }[state];
        const remaining = t(`${cooldown} ${cooldown === 1 ? 'zone' : 'zones'} left`,
                            `Noch ${cooldown} ${cooldown === 1 ? 'Zone' : 'Zonen'}`);
        const action = {
            off: t('Arm', 'Scharfstellen'), armed: t('Turn off', 'Ausschalten'),
            active: t('In effect', 'Wirkt'), cooldown: remaining, locked: label
        }[state];
        dialogStatus.textContent = state === 'active' && cooldown > 0 ? remaining : label;
        dialogToggle.textContent = action;
        dialogToggle.disabled = state !== 'armed' && state !== 'off';
        dialogToggle.dataset.state = state;
        lastLevel = level;
        lastState = state;
        lastCooldown = cooldown;
        if (pendingUnlock !== undefined) {
            pendingUnlock = undefined;
            showUnlock();
        }
    }

    dialogToggle.onclick = () => { magnetoShriek(); refresh(); };
    info.onclick = () => { dialog.showModal(); close.focus(); };
    close.onclick = () => dialog.close();
    dismiss.onclick = () => { notice.hidden = true; info.focus(); };
    function showUnlock() {
        const level = game.global.roboTrimpLevel;
        const mapLevel = getHighestBionic();
        const reward = Object.entries(game.bwRewards).find(([, item]) => item.requires === mapLevel);
        const title = level === 1 ? t('RoboTrimp unlocked', 'RoboTrimp freigeschaltet') : dialogLevel.textContent;
        const bonus = reward ? ` · ${reward[0]}` : '';
        notice.querySelector('span').textContent = `${title} · ${attack.textContent} ${t('attack', 'Angriff')} · ${shriek.textContent} ${t('boss attack', 'Bossangriff')}${bonus}`;
        notice.hidden = false;
    }
    watchUnlocks();
    return {
        refresh,
        watchUnlocks,
        back() {
            if (!dialog.open) return false;
            dialog.close();
            return true;
        }
    };
})();
