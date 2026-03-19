/* jshint esversion:11 */
'use strict';

// ==============================================================================
// TYPE COLOURS  (used for chips, skill buttons, card tints)
// ==============================================================================
const TYPE_COLORS = {
  normal:   '#A8A878', fire:     '#F08030', water:    '#6890F0',
  electric: '#F8D030', grass:    '#78C850', ice:      '#98D8D8',
  fighting: '#C03028', poison:   '#A040A0', ground:   '#E0C068',
  flying:   '#A890F0', psychic:  '#F85888', bug:      '#A8B820',
  rock:     '#B8A038', ghost:    '#705898', dragon:   '#7038F8',
  dark:     '#705848', steel:    '#B8B8D0', fairy:    '#EE99AC',
};

// ==============================================================================
// TYPE EFFECTIVENESS
// ==============================================================================
const TYPE_CHART = {
  fire:     { grass:2, ice:2, bug:2, steel:2,      water:.5, fire:.5, rock:.5, dragon:.5 },
  water:    { fire:2, ground:2, rock:2,             water:.5, grass:.5, dragon:.5 },
  grass:    { water:2, ground:2, rock:2,            fire:.5, grass:.5, poison:.5, flying:.5, bug:.5, dragon:.5, steel:.5 },
  electric: { water:2, flying:2,                   ground:0, electric:.5, grass:.5, dragon:.5 },
  ice:      { grass:2, ground:2, flying:2, dragon:2, fire:.5, water:.5, ice:.5, steel:.5 },
  fighting: { normal:2, ice:2, rock:2, dark:2, steel:2, poison:.5, bug:.5, psychic:.5, flying:.5, fairy:.5, ghost:0 },
  poison:   { grass:2, fairy:2,                    poison:.5, ground:.5, rock:.5, ghost:.5, steel:0 },
  ground:   { fire:2, electric:2, poison:2, rock:2, steel:2, grass:.5, bug:.5, flying:0 },
  flying:   { grass:2, fighting:2, bug:2,          electric:.5, rock:.5, steel:.5 },
  psychic:  { fighting:2, poison:2,                psychic:.5, steel:.5, dark:0 },
  bug:      { grass:2, psychic:2, dark:2,          fire:.5, fighting:.5, poison:.5, flying:.5, ghost:.5, steel:.5, fairy:.5 },
  rock:     { fire:2, ice:2, flying:2, bug:2,      fighting:.5, ground:.5, steel:.5 },
  ghost:    { psychic:2, ghost:2,                  normal:0, dark:.5 },
  dragon:   { dragon:2,                            steel:.5, fairy:0 },
  dark:     { psychic:2, ghost:2,                  fighting:.5, dark:.5, fairy:.5 },
  steel:    { ice:2, rock:2, fairy:2,              fire:.5, water:.5, electric:.5, steel:.5 },
  fairy:    { fighting:2, dragon:2, dark:2,        fire:.5, poison:.5, steel:.5 },
  normal:   {                                       rock:.5, steel:.5, ghost:0 },
};

// ==============================================================================
// SKILL TEMPLATES  (by primary type)
// ==============================================================================
const SKILL_TEMPLATES = {
  normal:   [
    { name:'Tackle',       power:1.0, type:'normal',   effect:null,                              cd:0 },
    { name:'Quick Attack', power:1.3, type:'normal',   effect:null,                              cd:1 },
    { name:'Hyper Beam',   power:3.0, type:'normal',   effect:null,                              cd:4 },
  ],
  fire:     [
    { name:'Ember',        power:1.2, type:'fire',     effect:null,                              cd:0 },
    { name:'Flamethrower', power:1.8, type:'fire',     effect:{kind:'burn',  chance:.3},         cd:2 },
    { name:'Fire Blast',   power:2.5, type:'fire',     effect:{kind:'burn',  chance:.5},         cd:4 },
  ],
  water:    [
    { name:'Water Gun',    power:1.2, type:'water',    effect:null,                              cd:0 },
    { name:'Surf',         power:1.8, type:'water',    effect:null,           target:'all',      cd:2 },
    { name:'Hydro Pump',   power:2.8, type:'water',    effect:null,                              cd:4 },
  ],
  grass:    [
    { name:'Vine Whip',    power:1.2, type:'grass',    effect:null,                              cd:0 },
    { name:'Razor Leaf',   power:1.5, type:'grass',    effect:null,           target:'all',      cd:2 },
    { name:'Solar Beam',   power:2.8, type:'grass',    effect:null,                              cd:4 },
  ],
  electric: [
    { name:'Shock',        power:1.1, type:'electric', effect:{kind:'para',  chance:.15},        cd:0 },
    { name:'Thunderbolt',  power:1.8, type:'electric', effect:{kind:'para',  chance:.3 },        cd:2 },
    { name:'Thunder',      power:2.5, type:'electric', effect:{kind:'para',  chance:.5 },        cd:4 },
  ],
  ice:      [
    { name:'Ice Shard',    power:1.2, type:'ice',      effect:null,                              cd:0 },
    { name:'Ice Beam',     power:1.8, type:'ice',      effect:{kind:'freeze',chance:.1 },        cd:2 },
    { name:'Blizzard',     power:2.5, type:'ice',      effect:{kind:'freeze',chance:.3 },target:'all',cd:4 },
  ],
  fighting: [
    { name:'Karate Chop',  power:1.2, type:'fighting', effect:null,                              cd:0 },
    { name:'Cross Chop',   power:2.0, type:'fighting', effect:null,                              cd:3 },
    { name:'Close Combat', power:2.8, type:'fighting', effect:{kind:'def_down',chance:1,self:true},cd:4},
  ],
  poison:   [
    { name:'Poison Sting', power:1.0, type:'poison',   effect:{kind:'poison',chance:.3 },        cd:0 },
    { name:'Sludge',       power:1.5, type:'poison',   effect:{kind:'poison',chance:.4 },        cd:2 },
    { name:'Sludge Bomb',  power:2.0, type:'poison',   effect:{kind:'poison',chance:.6 },        cd:3 },
  ],
  ground:   [
    { name:'Mud Slap',     power:1.0, type:'ground',   effect:{kind:'acc_down',chance:.5},       cd:0 },
    { name:'Earthquake',   power:2.0, type:'ground',   effect:null,           target:'all',      cd:3 },
    { name:'Earth Power',  power:1.8, type:'ground',   effect:{kind:'spdef_down',chance:.5},     cd:2 },
  ],
  flying:   [
    { name:'Wing Attack',  power:1.2, type:'flying',   effect:null,                              cd:0 },
    { name:'Air Slash',    power:1.5, type:'flying',   effect:{kind:'flinch',chance:.3},         cd:2 },
    { name:'Hurricane',    power:2.2, type:'flying',   effect:{kind:'confuse',chance:.3},        cd:3 },
  ],
  psychic:  [
    { name:'Confusion',    power:1.2, type:'psychic',  effect:null,                              cd:0 },
    { name:'Psybeam',      power:1.5, type:'psychic',  effect:{kind:'confuse',chance:.2},        cd:2 },
    { name:'Psychic',      power:2.0, type:'psychic',  effect:{kind:'spdef_down',chance:.5},     cd:3 },
  ],
  bug:      [
    { name:'Bug Bite',     power:1.0, type:'bug',      effect:null,                              cd:0 },
    { name:'Signal Beam',  power:1.5, type:'bug',      effect:{kind:'confuse',chance:.1},        cd:2 },
    { name:'Bug Buzz',     power:2.0, type:'bug',      effect:{kind:'spdef_down',chance:.3},     cd:3 },
  ],
  rock:     [
    { name:'Rock Throw',   power:1.2, type:'rock',     effect:null,                              cd:0 },
    { name:'Rock Slide',   power:1.5, type:'rock',     effect:{kind:'flinch',chance:.3},target:'all',cd:2 },
    { name:'Stone Edge',   power:2.2, type:'rock',     effect:null,           highCrit:true,     cd:3 },
  ],
  ghost:    [
    { name:'Shadow Sneak', power:1.0, type:'ghost',    effect:null,                              cd:0 },
    { name:'Shadow Ball',  power:1.8, type:'ghost',    effect:{kind:'spdef_down',chance:.2},     cd:2 },
    { name:'Hex',          power:2.0, type:'ghost',    effect:null,                              cd:3 },
  ],
  dragon:   [
    { name:'Dragon Breath',power:1.2, type:'dragon',   effect:{kind:'para',  chance:.3},         cd:0 },
    { name:'Dragon Claw',  power:1.8, type:'dragon',   effect:null,                              cd:2 },
    { name:'Draco Meteor', power:3.0, type:'dragon',   effect:{kind:'spa_down',chance:1,self:true},cd:4},
  ],
  dark:     [
    { name:'Bite',         power:1.2, type:'dark',     effect:{kind:'flinch',chance:.3},         cd:0 },
    { name:'Crunch',       power:1.8, type:'dark',     effect:{kind:'def_down',chance:.2},       cd:2 },
    { name:'Dark Pulse',   power:2.0, type:'dark',     effect:{kind:'flinch',chance:.2},         cd:3 },
  ],
  steel:    [
    { name:'Metal Claw',   power:1.2, type:'steel',    effect:{kind:'atk_up',chance:.1,self:true},cd:0 },
    { name:'Iron Head',    power:1.8, type:'steel',    effect:{kind:'flinch',chance:.3},         cd:2 },
    { name:'Flash Cannon', power:2.0, type:'steel',    effect:{kind:'spdef_down',chance:.5},     cd:3 },
  ],
  fairy:    [
    { name:'Fairy Wind',   power:1.0, type:'fairy',    effect:null,                              cd:0 },
    { name:'Dazzling Gleam',power:1.8,type:'fairy',    effect:null,           target:'all',      cd:2 },
    { name:'Moonblast',    power:2.2, type:'fairy',    effect:{kind:'spa_down',chance:.3},       cd:3 },
  ],
};

// ==============================================================================
// RAID DUNGEONS
// ==============================================================================
const RAID_DUNGEONS = [
  {
    id:'forest_1', name:'Forest of Beginnings', difficulty:1, star:'★',
    description:'A peaceful forest that hides secret power…',
    energyCost:3, bgColor:'#0b2e0b',
    rewards:{ coins:120, gems:3, xp:80 },
    waves:[
      [{ id:10, level:3 }, { id:13, level:3 }],
      [{ id:11, level:5 }, { id:14, level:4 }],
      [{ id:6,  level:8, boss:true }],
    ],
  },
  {
    id:'cave_1', name:'Crystal Cavern', difficulty:2, star:'★★',
    description:'Crystalline walls echo with haunted cries…',
    energyCost:5, bgColor:'#0d0d2e',
    rewards:{ coins:250, gems:6, xp:150 },
    waves:[
      [{ id:41, level:10 }, { id:42, level:10 }],
      [{ id:74, level:13 }, { id:95, level:13 }],
      [{ id:94, level:18, boss:true }],
    ],
  },
  {
    id:'ocean_1', name:'Sunken Depths', difficulty:3, star:'★★★',
    description:'Ancient behemoths rule these dark waters…',
    energyCost:7, bgColor:'#061428',
    rewards:{ coins:420, gems:12, xp:260 },
    waves:[
      [{ id:129, level:15 }, { id:54, level:15 }],
      [{ id:87,  level:18 }, { id:130, level:18 }],
      [{ id:9,   level:25, boss:true }],
    ],
  },
  {
    id:'volcano_1', name:'Magma Volcano', difficulty:4, star:'★★★★',
    description:'Legendary fire beasts pulse beneath the rock…',
    energyCost:10, bgColor:'#2e0d00',
    rewards:{ coins:700, gems:22, xp:420 },
    waves:[
      [{ id:58,  level:22 }, { id:77,  level:22 }],
      [{ id:126, level:26 }, { id:78,  level:26 }],
      [{ id:146, level:35, boss:true }],
    ],
  },
  {
    id:'tower_1', name:'Sky Tower', difficulty:5, star:'★★★★★',
    description:'The summit holds a legendary that defies time…',
    energyCost:15, bgColor:'#1a1a2e',
    rewards:{ coins:1200, gems:55, xp:750 },
    waves:[
      [{ id:144, level:35 }, { id:145, level:35 }],
      [{ id:143, level:40 }, { id:149, level:42 }],
      [{ id:150, level:55, boss:true }],
    ],
  },
  {
    id:'shadow_1', name:'Shadow Realm', difficulty:6, star:'✦✦✦✦✦✦',
    description:'Pure darkness — only the strongest survive…',
    energyCost:20, bgColor:'#050512',
    rewards:{ coins:2500, gems:110, xp:1400 },
    waves:[
      [{ id:248, level:55 }, { id:257, level:55 }],
      [{ id:445, level:60 }, { id:448, level:60 }],
      [{ id:249, level:75, boss:true }],
    ],
  },
];

const STARTER_PICKS = [
  { id:1,  name:'Bulbasaur',  type:'grass',    desc:'Resilient & steady. Ideal for beginners.' },
  { id:4,  name:'Charmander', type:'fire',     desc:'Blazing spirit. High attack potential.' },
  { id:7,  name:'Squirtle',   type:'water',    desc:'Defensive master. Never gives up.' },
];

const MAX_TEAM = 5;
const TOTAL_POKEMON = 1025;
const SPRITE = id => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
const API    = id => `https://pokeapi.co/api/v2/pokemon/${id}`;

// ==============================================================================
// POKÉMON API  (with localStorage caching)
// ==============================================================================
const PokemonAPI = (() => {
  const CACHE_KEY = 'rm_pokemon_cache_v2';
  let _cache = null;

  function _loadCache() {
    if (_cache) return;
    try { _cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); }
    catch { _cache = {}; }
  }
  function _saveCache() {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(_cache)); }
    catch { /* quota exceeded – just skip */ }
  }

  async function fetchRaw(id) {
    _loadCache();
    if (_cache[id]) return _cache[id];
    const res  = await fetch(API(id));
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    const poke = {
      id:    data.id,
      name:  data.name,
      types: data.types.map(t => t.type.name),
      base:  {
        hp:  data.stats.find(s => s.stat.name === 'hp').base_stat,
        atk: data.stats.find(s => s.stat.name === 'attack').base_stat,
        def: data.stats.find(s => s.stat.name === 'defense').base_stat,
        spd: data.stats.find(s => s.stat.name === 'speed').base_stat,
        spa: data.stats.find(s => s.stat.name === 'special-attack').base_stat,
        spdef: data.stats.find(s => s.stat.name === 'special-defense').base_stat,
      },
    };
    _cache[id] = poke;
    _saveCache();
    return poke;
  }

  /** Build a Champion object from raw poke data + level + stars */
  function buildChampion(raw, level = 1, stars = 1, isEnemy = false) {
    const mult   = 1 + (stars - 1) * 0.25;
    const lMult  = level / 10 + 0.5;
    const hp     = Math.max(1, Math.floor(raw.base.hp  * lMult * mult * 12));
    const atk    = Math.max(1, Math.floor(raw.base.atk * lMult * mult * 0.6));
    const def    = Math.max(1, Math.floor(raw.base.def * lMult * mult * 0.6));
    const spd    = Math.max(1, Math.floor(raw.base.spd * lMult * mult * 0.6));

    const primaryType = raw.types[0];
    const pool  = (SKILL_TEMPLATES[primaryType] || SKILL_TEMPLATES.normal).slice(0, 3);
    const secType = raw.types[1];
    if (secType && SKILL_TEMPLATES[secType]) {
      const bonus = SKILL_TEMPLATES[secType][1] || SKILL_TEMPLATES[secType][0];
      if (bonus && !pool.find(s => s.name === bonus.name)) pool.push(bonus);
    }
    const skills = pool.map(t => ({ ...t, cdLeft: 0 }));

    return {
      uid:      isEnemy ? `e${raw.id}_${Math.random().toString(36).slice(2,6)}` : `p${raw.id}`,
      id:       raw.id,
      name:     raw.name,
      types:    raw.types,
      level,
      stars,
      base:     raw.base,
      maxHp:    hp, currentHp: hp,
      atk, def, spd,
      skills,
      status:   null,   // burn | poison | para | freeze
      buffs:    {},
      isEnemy,
      isPlayer: !isEnemy,
    };
  }

  return { fetchRaw, buildChampion };
})();

// ==============================================================================
// GAME STATE  (localStorage persistence)
// ==============================================================================
const STATE_KEY = 'rm_state_v3';

const GameState = (() => {
  let s = null;

  function _default() {
    return {
      playerName: 'Trainer',
      coins: 500,
      gems:  30,
      energy: 20, maxEnergy: 20,
      rosterRaw: [],    // array of { id, level, stars }
      team:      [],    // array of ids currently in team (up to MAX_TEAM)
      completedRaids: {},
      totalSummons: 0,
      firstPlay: true,
    };
  }

  function load() {
    try { s = JSON.parse(localStorage.getItem(STATE_KEY)); }
    catch { s = null; }
    if (!s) s = _default();
    return s;
  }
  function save() { localStorage.setItem(STATE_KEY, JSON.stringify(s)); }
  function get()  { return s; }

  function addToRoster(raw, stars = 1) {
    // Check if already owned – upgrade stars instead
    const existing = s.rosterRaw.find(r => r.id === raw.id);
    if (existing) {
      existing.stars = Math.min(6, existing.stars + 1);
    } else {
      s.rosterRaw.push({ id: raw.id, level: 1, stars });
    }
    save();
  }

  function levelUp(id) {
    const r = s.rosterRaw.find(r => r.id === id);
    if (r) { r.level = Math.min(100, r.level + 1); save(); }
  }

  function spendCoins(n) {
    if (s.coins < n) return false;
    s.coins -= n; save(); return true;
  }
  function spendGems(n) {
    if (s.gems < n) return false;
    s.gems -= n; save(); return true;
  }
  function earnCoins(n) { s.coins += n; save(); }
  function earnGems(n)  { s.gems  += n; save(); }
  function earnEnergy(n){ s.energy = Math.min(s.maxEnergy, s.energy + n); save(); }
  function useEnergy(n) {
    if (s.energy < n) return false;
    s.energy -= n; save(); return true;
  }

  function setTeam(ids) { s.team = ids.slice(0, MAX_TEAM); save(); }

  function markRaidComplete(raidId) {
    s.completedRaids[raidId] = (s.completedRaids[raidId] || 0) + 1;
    save();
  }

  return { load, save, get, addToRoster, levelUp, spendCoins, spendGems,
           earnCoins, earnGems, earnEnergy, useEnergy, setTeam, markRaidComplete };
})();

// ==============================================================================
// BATTLE ENGINE
// ==============================================================================
class BattleEngine {
  constructor(playerChamps, enemyChamps, raidId) {
    this.playerChamps = playerChamps; // Champion[]
    this.enemyChamps  = enemyChamps;  // Champion[]
    this.raidId       = raidId;
    this.log          = '';
    this.over         = false;
    this.playerWon    = false;
    this.pendingActions = [];  // UI feedback queue
    this.autoPlay     = false;
    this._buildTurnOrder();
  }

  _buildTurnOrder() {
    const all = [...this.playerChamps, ...this.enemyChamps];
    this.turnOrder = all
      .filter(c => c.currentHp > 0)
      .sort((a, b) => b.spd - a.spd);
    this.turnIdx = 0;
  }

  get currentActor() {
    const alive = this.turnOrder.filter(c => c.currentHp > 0);
    if (!alive.length) return null;
    return alive[this.turnIdx % alive.length];
  }

  _nextTurn() {
    const alive = this.turnOrder.filter(c => c.currentHp > 0);
    if (!alive.length) return;
    this.turnIdx = (this.turnIdx + 1) % alive.length;
    // Rebuild turnOrder to remove fainted
    this.turnOrder = alive;
  }

  /** Returns { damage, effectiveness, crit, isMiss } */
  _calcDamage(attacker, defender, skill) {
    // Status can block actions
    if (attacker.status === 'para'   && Math.random() < .25) return { damage:0, effectiveness:1, isMiss:true };
    if (attacker.status === 'freeze' && Math.random() < .5)  return { damage:0, effectiveness:1, isMiss:true };

    const atkStat = attacker.atk * (attacker.buffs.atk || 1);
    const defStat = defender.def * (defender.buffs.def || 1);
    const base    = (atkStat / Math.max(1, defStat)) * skill.power * 8;
    const variance= .85 + Math.random() * .15;
    const crit    = (skill.highCrit ? Math.random() < .25 : Math.random() < .0625);
    const critMult= crit ? 1.5 : 1;

    // Type effectiveness
    let eff = 1;
    const defTypes = defender.types;
    const chart    = TYPE_CHART[skill.type] || {};
    defTypes.forEach(dt => { if (chart[dt] !== undefined) eff *= chart[dt]; });

    const dmg = Math.max(1, Math.round(base * variance * critMult * eff));
    return { damage: dmg, effectiveness: eff, crit, isMiss: false };
  }

  /** Apply a skill from attacker to a list of targets */
  _applySkill(attacker, targets, skill) {
    const actions = [];
    skill.cdLeft = skill.cd;
    let hadCrit = false;

    for (const defender of targets) {
      if (defender.currentHp <= 0) continue;

      const { damage, effectiveness, crit, isMiss } = this._calcDamage(attacker, defender, skill);

      if (isMiss) {
        actions.push({ type:'miss', target: defender.uid });
        continue;
      }

      if (crit) hadCrit = true;

      // Apply damage
      defender.currentHp = Math.max(0, defender.currentHp - damage);
      actions.push({ type:'damage', target: defender.uid, amount: damage,
                     effectiveness, crit });

      // Apply effect
      if (skill.effect && !skill.effect.self && Math.random() < skill.effect.chance) {
        this._applyEffect(defender, skill.effect.kind);
        actions.push({ type:'status', target: defender.uid, status: skill.effect.kind });
      }
    }

    // Self effects (e.g. Close Combat lowers own def)
    if (skill.effect && skill.effect.self && Math.random() < skill.effect.chance) {
      this._applyEffect(attacker, skill.effect.kind);
      actions.push({ type:'status', target: attacker.uid, status: skill.effect.kind });
    }

    this.log = `${attacker.name} used ${skill.name}!`;
    if (hadCrit) this.log += ' Critical hit!';
    return actions;
  }

  _applyEffect(target, kind) {
    switch (kind) {
      case 'burn':       if (!target.status) target.status = 'burn';    break;
      case 'poison':     if (!target.status) target.status = 'poison';  break;
      case 'para':       if (!target.status) target.status = 'para';    break;
      case 'freeze':     if (!target.status) target.status = 'freeze';  break;
      case 'def_down':   target.buffs.def  = (target.buffs.def  || 1) * .75; break;
      case 'atk_up':     target.buffs.atk  = (target.buffs.atk  || 1) * 1.2; break;
      case 'spdef_down': target.buffs.spdef= (target.buffs.spdef|| 1) * .75; break;
      case 'spa_down':   target.buffs.spa  = (target.buffs.spa  || 1) * .75; break;
      case 'acc_down':   target.buffs.acc  = (target.buffs.acc  || 1) * .75; break;
      default: break;
    }
  }

  _tickStatus(champ) {
    const dmg = { burn: Math.floor(champ.maxHp * .0625), poison: Math.floor(champ.maxHp * .125) };
    const actions = [];
    if (champ.status === 'burn' || champ.status === 'poison') {
      const d = dmg[champ.status];
      champ.currentHp = Math.max(0, champ.currentHp - d);
      actions.push({ type:'dot', target: champ.uid, amount: d });
    }
    // Freeze might thaw
    if (champ.status === 'freeze' && Math.random() < .2) {
      champ.status = null;
      actions.push({ type:'thaw', target: champ.uid });
    }
    // Reduce skill cooldowns
    champ.skills.forEach(s => { if (s.cdLeft > 0) s.cdLeft--; });
    return actions;
  }

  /** Player uses skill at skillIndex for current actor */
  playerAction(skillIndex) {
    if (this.over) return [];
    const actor  = this.currentActor;
    if (!actor || actor.isEnemy) return [];
    const skill  = actor.skills[skillIndex];
    if (!skill || skill.cdLeft > 0) return [];

    const targets = skill.target === 'all'
      ? this.enemyChamps.filter(e => e.currentHp > 0)
      : [this._pickTarget(this.enemyChamps)];

    const actions = this._applySkill(actor, targets, skill);
    const dotActs = this._tickStatus(actor);
    const all     = [...actions, ...dotActs];

    this._checkWin();
    if (!this.over) this._nextTurn();
    return all;
  }

  /** AI picks and executes an enemy turn */
  enemyAction() {
    if (this.over) return [];
    const actor = this.currentActor;
    if (!actor || actor.isPlayer) return [];

    // Pick a usable skill (prefer higher power ones if off cooldown)
    const usable = actor.skills.filter(s => s.cdLeft === 0);
    const skill  = usable.sort((a, b) => b.power - a.power)[0] || actor.skills[0];

    const targets = skill.target === 'all'
      ? this.playerChamps.filter(p => p.currentHp > 0)
      : [this._pickTarget(this.playerChamps)];

    const actions = this._applySkill(actor, targets, skill);
    const dotActs = this._tickStatus(actor);
    const all     = [...actions, ...dotActs];

    this._checkWin();
    if (!this.over) this._nextTurn();
    return all;
  }

  _pickTarget(side) {
    const alive = side.filter(c => c.currentHp > 0);
    if (!alive.length) return side[0];
    // Target the lowest HP
    return alive.reduce((a, b) => a.currentHp < b.currentHp ? a : b);
  }

  _checkWin() {
    const playerAlive = this.playerChamps.some(c => c.currentHp > 0);
    const enemyAlive  = this.enemyChamps.some(c => c.currentHp > 0);
    if (!enemyAlive) { this.over = true; this.playerWon = true;  }
    if (!playerAlive){ this.over = true; this.playerWon = false; }
  }

  get turnOrderInfo() {
    return this.turnOrder.filter(c => c.currentHp > 0);
  }
}

// ==============================================================================
// TOAST
// ==============================================================================
function showToast(msg, duration = 2400) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => t.classList.remove('show'), duration);
}

// ==============================================================================
// MODAL
// ==============================================================================
function openModal(htmlContent, centered = false) {
  const overlay = document.getElementById('modal-overlay');
  const box     = document.getElementById('modal-box');
  overlay.classList.remove('hidden', 'center');
  if (centered) overlay.classList.add('center');
  box.className = 'modal-box' + (centered ? ' center-modal' : '');
  box.innerHTML = `
    <div class="modal-close">
      <button class="modal-close-btn" onclick="closeModal()" aria-label="Close">✕</button>
    </div>
    ${htmlContent}
  `;
  box.scrollTop = 0;
}
function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}

// ==============================================================================
// SCREEN MANAGER
// ==============================================================================
let _currentScreen = null;
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(`screen-${id}`);
  if (el) {
    el.classList.add('active');
    _currentScreen = id;
  }
}

// ==============================================================================
// RENDER HELPERS
// ==============================================================================
function typeChip(t) {
  const col = TYPE_COLORS[t] || '#888';
  return `<span class="chip" style="background:${col}">${t}</span>`;
}

function starsHtml(n) {
  return '★'.repeat(n) + '☆'.repeat(Math.max(0, 6 - n));
}

function hpBarHtml(current, max, small = false) {
  const pct  = max > 0 ? (current / max) * 100 : 0;
  const cls  = pct > 50 ? '' : pct > 25 ? 'mid' : 'low';
  const h    = small ? 5 : 8;
  return `
    <div class="hp-bar-wrap">
      <div class="hp-label"><span>HP</span><span>${current}/${max}</span></div>
      <div class="hp-track" style="height:${h}px">
        <div class="hp-fill ${cls}" style="width:${pct}%"></div>
      </div>
    </div>`;
}

function statusIconHtml(s) {
  if (!s) return '';
  const map = { burn:'🔥', poison:'☠️', para:'⚡', freeze:'❄️' };
  return `<span class="status-icon status-${s}" title="${s}">${map[s] || s}</span>`;
}

function skillColor(type) {
  const base = TYPE_COLORS[type] || '#555';
  return `background: linear-gradient(135deg, ${base}cc, ${base}66)`;
}

// ==============================================================================
// ACTIVE BATTLE STATE  (module-level so UI can reach it)
// ==============================================================================
let _battle    = null;
let _waveIdx   = 0;
let _raidDef   = null;
let _playerBuilt = [];  // built Champion[] for player team (persists across waves)

// ==============================================================================
// RENDER FUNCTIONS  (one per screen)
// ==============================================================================

/* ---- TITLE ---- */
function renderTitle() {
  const el = document.getElementById('screen-title');
  el.innerHTML = `
    <div class="title-art">RAID<br>MONSTER</div>
    <p class="title-sub">Collect · Train · Raid</p>
    <p class="title-tagline">A Pokémon-style Raid RPG featuring over 1,000 champions to collect and battle!</p>
    <div class="title-badges">
      <span class="badge">🎮 1,025+ Champions</span>
      <span class="badge">⚔️ Raid Dungeons</span>
      <span class="badge">📱 Mobile Ready</span>
      <span class="badge">💾 Auto-Save</span>
    </div>
    <button class="btn btn-gold btn-lg" id="btn-start-game" style="max-width:280px">
      ⚔️ START ADVENTURE
    </button>
    <p class="version-tag">v1.0.0 · Open-source · PokéAPI powered</p>
  `;
  document.getElementById('btn-start-game').addEventListener('click', () => {
    const st = GameState.get();
    if (st.firstPlay) {
      showScreen('starter');
      renderStarter();
    } else {
      showScreen('hub');
      renderHub();
    }
  });
}

/* ---- STARTER ---- */
function renderStarter() {
  const el = document.getElementById('screen-starter');
  el.innerHTML = `
    <div class="top-bar">
      <span class="top-bar-title">Choose Your Starter</span>
    </div>
    <div class="starter-intro">
      <h2>Your Adventure Begins!</h2>
      <p>Pick your first champion. They will join your team and lead you into battle.</p>
    </div>
    <div class="starter-grid" id="starter-grid"></div>
    <div style="padding:0 16px 24px">
      <button class="btn btn-gold btn-lg" id="btn-confirm-starter" disabled>
        Confirm Starter
      </button>
    </div>
  `;

  let selectedId = null;
  const grid = document.getElementById('starter-grid');

  STARTER_PICKS.forEach(s => {
    const card = document.createElement('div');
    card.className = 'starter-card';
    card.innerHTML = `
      <img src="${SPRITE(s.id)}" alt="${s.name}" loading="lazy" />
      <span class="starter-name">${s.name}</span>
      <span class="starter-type-badge" style="background:${TYPE_COLORS[s.type]}">${s.type}</span>
      <span class="starter-desc">${s.desc}</span>
    `;
    card.addEventListener('click', () => {
      document.querySelectorAll('.starter-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedId = s.id;
      document.getElementById('btn-confirm-starter').disabled = false;
    });
    grid.appendChild(card);
  });

  document.getElementById('btn-confirm-starter').addEventListener('click', async () => {
    if (!selectedId) return;
    const btn = document.getElementById('btn-confirm-starter');
    btn.disabled = true; btn.textContent = 'Loading…';
    try {
      const raw = await PokemonAPI.fetchRaw(selectedId);
      GameState.addToRoster(raw, 3);
      const st = GameState.get();
      st.firstPlay = false;
      // Give starter team slot
      st.team = [selectedId];
      GameState.save();
      showScreen('hub');
      renderHub();
    } catch {
      btn.disabled = false; btn.textContent = 'Confirm Starter';
      showToast('⚠️ Could not load Pokémon data. Check your connection.');
    }
  });
}

/* ---- HUB (main navigation frame) ---- */
function renderHub(sub = 'raids') {
  const el  = document.getElementById('screen-hub');
  const st  = GameState.get();
  const pct = st.maxEnergy > 0 ? (st.energy / st.maxEnergy) * 100 : 0;

  el.innerHTML = `
    <div class="top-bar">
      <span class="top-bar-title">⚔️ RaidMonster</span>
      <span style="font-size:.75rem;color:var(--text-muted)">${st.playerName}</span>
    </div>
    <div class="currency-bar">
      <div class="currency-item"><span class="currency-icon">🪙</span><span id="coins-display">${st.coins}</span></div>
      <div class="currency-item"><span class="currency-icon">💎</span><span id="gems-display">${st.gems}</span></div>
      <div class="energy-bar-wrap">
        <span>⚡</span>
        <div class="energy-progress"><div class="energy-fill" style="width:${pct}%"></div></div>
        <span id="energy-display">${st.energy}/${st.maxEnergy}</span>
      </div>
    </div>
    <div id="hub-content" class="scroll-area" style="flex:1"></div>
    <nav class="bottom-nav">
      <button class="nav-btn ${sub==='raids'?'active':''}" data-sub="raids">
        <span class="nav-icon">🗺️</span>Raids
      </button>
      <button class="nav-btn ${sub==='champions'?'active':''}" data-sub="champions">
        <span class="nav-icon">🏆</span>Champions
      </button>
      <button class="nav-btn ${sub==='team'?'active':''}" data-sub="team">
        <span class="nav-icon">⚔️</span>Team
      </button>
      <button class="nav-btn ${sub==='summon'?'active':''}" data-sub="summon">
        <span class="nav-icon">✨</span>Summon
      </button>
    </nav>
  `;

  el.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const s = btn.dataset.sub;
      renderHub(s);
    });
  });

  const content = document.getElementById('hub-content');
  if (sub === 'raids')      renderRaids(content);
  if (sub === 'champions')  renderChampions(content);
  if (sub === 'team')       renderTeam(content);
  if (sub === 'summon')     renderSummon(content);
}

function refreshCurrency() {
  const st = GameState.get();
  const c  = document.getElementById('coins-display');
  const g  = document.getElementById('gems-display');
  const e  = document.getElementById('energy-display');
  const ef = document.querySelector('.energy-fill');
  if (c) c.textContent = st.coins;
  if (g) g.textContent = st.gems;
  if (e) e.textContent = `${st.energy}/${st.maxEnergy}`;
  if (ef) ef.style.width = `${(st.energy / st.maxEnergy) * 100}%`;
}

/* ---- RAIDS ---- */
function renderRaids(container) {
  const st    = GameState.get();
  const owned = st.rosterRaw.length;
  const teamSz= st.team.length;

  let html = `
    <div class="padded">
      <p class="section-label">Active Dungeons</p>
    </div>
    <div class="raid-list">
  `;

  RAID_DUNGEONS.forEach((r, idx) => {
    const complete  = st.completedRaids[r.id] || 0;
    const unlocked  = idx === 0 || st.completedRaids[RAID_DUNGEONS[idx - 1].id];
    const hasTeam   = teamSz > 0;
    const locked    = !unlocked;

    html += `
      <div class="raid-card ${locked ? 'locked' : ''}" data-raid="${r.id}"
           style="border-left: 4px solid ${r.bgColor || 'var(--border)'}">
        ${complete ? `<div class="raid-complete-badge">✓ Cleared ×${complete}</div>` : ''}
        <div class="raid-card-header">
          <span class="raid-name">${r.name}</span>
          <span class="raid-stars">${r.star}</span>
        </div>
        <p class="raid-desc">${r.description}</p>
        <div class="raid-meta">
          <span>⚡ Energy: ${r.energyCost}</span>
          <span>🌊 Waves: ${r.waves.length}</span>
          ${locked ? '<span>🔒 Clear previous raid first</span>' : ''}
        </div>
        <div class="raid-rewards">
          <span class="reward-chip">🪙 ${r.rewards.coins}</span>
          <span class="reward-chip">💎 ${r.rewards.gems}</span>
          <span class="reward-chip">⭐ ${r.rewards.xp} XP</span>
        </div>
        ${!locked && !hasTeam ? '<p style="font-size:.75rem;color:var(--red);margin-top:4px">⚠️ Build your team first!</p>' : ''}
      </div>
    `;
  });

  html += `</div>
    <div class="padded" style="padding-top:0">
      <p class="section-label" style="margin-bottom:8px">Your Progress</p>
      <div class="flex gap-sm" style="flex-wrap:wrap">
        <div class="pokedex-counter">📖 Champions owned: <span>${owned}</span></div>
        <div class="pokedex-counter">⚔️ Team size: <span>${teamSz}/${MAX_TEAM}</span></div>
        <div class="pokedex-counter">🏆 Total Pokémon: <span>1,025</span></div>
      </div>
    </div>
  `;

  container.innerHTML = html;

  container.querySelectorAll('.raid-card:not(.locked)').forEach(card => {
    card.addEventListener('click', () => startRaid(card.dataset.raid));
  });
}

/* ---- CHAMPIONS ---- */
async function renderChampions(container) {
  const st = GameState.get();
  if (st.rosterRaw.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🏆</div>
        <p>No champions yet!</p>
        <p style="font-size:.85rem">Visit Summon to recruit new champions.</p>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div class="search-bar">
      <input class="search-input" id="champ-search" placeholder="🔍 Search champions…" type="text" />
    </div>
    <div class="champion-grid" id="champ-grid"></div>
  `;

  const renderGrid = (filter = '') => {
    const grid  = document.getElementById('champ-grid');
    const items = st.rosterRaw.filter(r =>
      !filter || r.cachedName?.toLowerCase().includes(filter.toLowerCase())
    );
    if (!items.length) { grid.innerHTML = `<p class="padded" style="color:var(--text-muted)">No matches.</p>`; return; }

    grid.innerHTML = '';
    items.forEach(r => {
      const inTeam = st.team.includes(r.id);
      const card   = document.createElement('div');
      card.className = `champion-card ${inTeam ? 'in-team' : ''}`;
      const name = r.cachedName || `#${r.id}`;
      card.innerHTML = `
        ${inTeam ? `<div class="champion-team-badge">TEAM</div>` : ''}
        <img class="champion-sprite" src="${SPRITE(r.id)}" alt="${name}" loading="lazy" />
        <span class="champion-name">${name}</span>
        <span class="champion-stars" style="font-size:.8rem">${starsHtml(r.stars)}</span>
        <span class="champion-level">Lv.${r.level}</span>
        <div class="champion-types">${(r.cachedTypes || []).map(typeChip).join('')}</div>
      `;
      card.addEventListener('click', () => showChampDetail(r));
      grid.appendChild(card);
    });
  };

  renderGrid();

  // Pre-load names/types for owned champions
  for (const r of st.rosterRaw) {
    if (!r.cachedName) {
      PokemonAPI.fetchRaw(r.id).then(raw => {
        r.cachedName  = raw.name;
        r.cachedTypes = raw.types;
        GameState.save();
        const grid = document.getElementById('champ-grid');
        if (grid) renderGrid(document.getElementById('champ-search')?.value || '');
      }).catch(() => {});
    }
  }

  document.getElementById('champ-search').addEventListener('input', e => {
    renderGrid(e.target.value);
  });
}

/* ---- TEAM BUILDER ---- */
async function renderTeam(container) {
  const st  = GameState.get();
  const owned = st.rosterRaw;
  const team  = st.team;

  container.innerHTML = `
    <div class="padded">
      <p class="screen-title">⚔️ Build Your Team</p>
      <p style="font-size:.8rem;color:var(--text-muted);margin:4px 0 12px">
        Select up to ${MAX_TEAM} champions. Tap a slot to remove.
      </p>
    </div>
    <div class="team-slots" id="team-slots"></div>
    <div class="divider"></div>
    <div class="padded"><p class="section-label">Your Roster</p></div>
    <div class="champion-grid" id="roster-for-team"></div>
  `;

  const rebuildSlots = () => {
    const slots = document.getElementById('team-slots');
    if (!slots) return;
    slots.innerHTML = '';
    for (let i = 0; i < MAX_TEAM; i++) {
      const id  = st.team[i];
      const div = document.createElement('div');
      div.className = `team-slot ${id ? 'filled' : ''}`;
      if (id) {
        const r = owned.find(o => o.id === id);
        div.innerHTML = `<img src="${SPRITE(id)}" alt="#${id}" /><span style="font-size:.65rem;color:var(--text-muted)">${r?.cachedName || `#${id}`}</span>`;
        div.addEventListener('click', () => {
          st.team.splice(i, 1);
          GameState.save();
          rebuildSlots();
          rebuildRoster();
        });
      } else {
        div.innerHTML = `<span style="font-size:1.4rem">+</span><span>Empty</span>`;
      }
      slots.appendChild(div);
    }
  };

  const rebuildRoster = () => {
    const grid = document.getElementById('roster-for-team');
    if (!grid) return;
    grid.innerHTML = '';
    owned.forEach(r => {
      const inTeam = st.team.includes(r.id);
      const card   = document.createElement('div');
      card.className = `champion-card ${inTeam ? 'in-team' : ''}`;
      card.innerHTML = `
        ${inTeam ? `<div class="champion-team-badge">IN</div>` : ''}
        <img class="champion-sprite" src="${SPRITE(r.id)}" alt="#${r.id}" loading="lazy" />
        <span class="champion-name">${r.cachedName || `#${r.id}`}</span>
        <span class="champion-stars" style="font-size:.75rem">${starsHtml(r.stars)}</span>
        <span class="champion-level">Lv.${r.level}</span>
      `;
      card.addEventListener('click', () => {
        if (inTeam) {
          const idx = st.team.indexOf(r.id);
          st.team.splice(idx, 1);
          GameState.save();
        } else if (st.team.length < MAX_TEAM) {
          st.team.push(r.id);
          GameState.save();
        } else {
          showToast(`Team is full! (max ${MAX_TEAM})`);
        }
        rebuildSlots();
        rebuildRoster();
      });
      grid.appendChild(card);
    });
  };

  rebuildSlots();
  rebuildRoster();

  // Pre-load names
  for (const r of owned) {
    if (!r.cachedName) {
      PokemonAPI.fetchRaw(r.id).then(raw => {
        r.cachedName  = raw.name;
        r.cachedTypes = raw.types;
        GameState.save();
        rebuildRoster();
      }).catch(() => {});
    }
  }
}

/* ---- SUMMON SCREEN ---- */
function renderSummon(container) {
  const st = GameState.get();
  container.innerHTML = `
    <div class="padded">
      <p class="screen-title">✨ Summon Champions</p>
      <p style="font-size:.8rem;color:var(--text-muted);margin:4px 0 12px">
        Spend currency to recruit new Pokémon champions from all 1,025 available!
      </p>
    </div>
    <div class="summon-options">
      <div class="summon-card" id="summon-basic">
        <div class="summon-card-header">
          <span class="summon-title">🪙 Basic Summon</span>
          <span class="summon-cost" style="color:var(--gold)">200 Coins</span>
        </div>
        <p class="summon-desc">Randomly summon a Pokémon from all generations. Guaranteed 1–3 stars.</p>
        <p class="summon-odds">★★★ 10% · ★★ 30% · ★ 60%</p>
        <button class="btn btn-gold" style="width:100%;min-height:44px" id="btn-basic-summon">
          Summon (${st.coins} 🪙)
        </button>
      </div>

      <div class="summon-card premium" id="summon-premium">
        <div class="summon-card-header">
          <span class="summon-title">💎 Premium Summon</span>
          <span class="summon-cost" style="color:var(--cyan)">20 Gems</span>
        </div>
        <p class="summon-desc">Premium pool with higher rarity rates. Includes rare & legendary Pokémon!</p>
        <p class="summon-odds">★★★★★ 5% · ★★★★ 15% · ★★★ 35% · ★★ 35% · ★ 10%</p>
        <button class="btn btn-purple" style="width:100%;min-height:44px" id="btn-premium-summon">
          Summon (${st.gems} 💎)
        </button>
      </div>

      <div class="summon-card" id="summon-x10">
        <div class="summon-card-header">
          <span class="summon-title">🎰 10× Premium Summon</span>
          <span class="summon-cost" style="color:var(--cyan)">180 Gems</span>
        </div>
        <p class="summon-desc">10 premium summons at once! Guaranteed at least one 4★ or higher.</p>
        <button class="btn btn-purple" style="width:100%;min-height:44px" id="btn-x10-summon">
          10× Summon (180 💎)
        </button>
      </div>
    </div>
    <div id="summon-result-area" style="padding:0 16px 24px"></div>

    <div class="padded">
      <p class="section-label" style="margin-bottom:8px">Browse All Champions</p>
      <p style="font-size:.8rem;color:var(--text-muted)">
        All ${TOTAL_POKEMON.toLocaleString()} Pokémon are available to collect!
        Tap any to preview.
      </p>
    </div>
    <div class="search-bar">
      <input class="search-input" id="browse-search" placeholder="🔍 Search by name or #ID…" />
    </div>
    <div class="pokemon-browse-grid" id="browse-grid"></div>
  `;

  document.getElementById('btn-basic-summon').addEventListener('click', () => doSummon('basic'));
  document.getElementById('btn-premium-summon').addEventListener('click', () => doSummon('premium'));
  document.getElementById('btn-x10-summon').addEventListener('click', () => doSummon('x10'));

  // Render a random sample browse grid (50 random)
  renderBrowseGrid('');
  document.getElementById('browse-search').addEventListener('input', e => {
    renderBrowseGrid(e.target.value);
  });
}

function renderBrowseGrid(filter) {
  const grid = document.getElementById('browse-grid');
  if (!grid) return;
  grid.innerHTML = '';

  let ids;
  if (filter.trim()) {
    const q = filter.trim().toLowerCase();
    // If numeric, search by ID range; otherwise show up to 30 matches
    if (/^\d+$/.test(q)) {
      const num = parseInt(q, 10);
      ids = [num].filter(n => n >= 1 && n <= TOTAL_POKEMON);
    } else {
      // We can only match against pre-cached names
      const cache = (() => { try { return JSON.parse(localStorage.getItem('rm_pokemon_cache_v2') || '{}'); } catch { return {}; } })();
      ids = Object.values(cache)
        .filter(p => p.name.includes(q))
        .slice(0, 40)
        .map(p => p.id);
      // If no cache hits, show a numeric range around query length
      if (!ids.length) {
        ids = Array.from({ length: 30 }, (_, i) => i + 1);
      }
    }
  } else {
    // Random 48
    const set = new Set();
    while (set.size < 48) set.add(Math.floor(Math.random() * TOTAL_POKEMON) + 1);
    ids = [...set].sort((a, b) => a - b);
  }

  ids.forEach(id => {
    const card = document.createElement('div');
    card.className = 'pokemon-browse-card';
    card.innerHTML = `
      <img src="${SPRITE(id)}" alt="#${id}" loading="lazy" />
      <span class="pokemon-browse-name" id="browse-name-${id}">#${id}</span>
      <span class="pokemon-browse-id">#${String(id).padStart(4, '0')}</span>
    `;
    card.addEventListener('click', () => previewPokemon(id));
    grid.appendChild(card);

    // Async fill name
    PokemonAPI.fetchRaw(id).then(raw => {
      const el = document.getElementById(`browse-name-${id}`);
      if (el) el.textContent = raw.name;
    }).catch(() => {});
  });
}

async function previewPokemon(id) {
  const loadHtml = `<div style="padding:40px;text-align:center"><div class="spinner" style="margin:0 auto"></div></div>`;
  openModal(loadHtml, true);
  try {
    const raw = await PokemonAPI.fetchRaw(id);
    const st  = GameState.get();
    const owned = st.rosterRaw.find(r => r.id === id);
    openModal(`
      <div style="padding:16px;display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center">
        <img src="${SPRITE(id)}" style="width:120px;height:120px;image-rendering:pixelated;filter:drop-shadow(0 4px 16px rgba(255,215,0,.4))" />
        <h2 style="font-size:1.4rem;color:var(--gold);text-transform:capitalize">${raw.name}</h2>
        <div style="display:flex;gap:6px">${raw.types.map(typeChip).join('')}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%;text-align:left">
          ${['hp','atk','def','spd'].map(s => `
            <div style="background:var(--bg-card3);padding:8px;border-radius:8px">
              <div style="font-size:.65rem;color:var(--text-muted);text-transform:uppercase">${s}</div>
              <div style="font-size:1.1rem;font-weight:700;color:var(--text)">${raw.base[s]}</div>
            </div>`).join('')}
        </div>
        ${owned
          ? `<p style="color:var(--green);font-weight:700">✓ Owned — Lv.${owned.level} ${starsHtml(owned.stars)}</p>`
          : `<button class="btn btn-purple" style="width:100%" onclick="doDirectSummon(${id});closeModal()">
               ✨ Summon This Champion (20 💎)
             </button>`
        }
      </div>
    `, true);
  } catch {
    openModal(`<div class="empty-state"><p>Could not load Pokémon data.</p></div>`, true);
  }
}

async function doDirectSummon(id) {
  if (!GameState.spendGems(20)) { showToast('Not enough gems! 💎'); return; }
  try {
    const raw = await PokemonAPI.fetchRaw(id);
    const stars = 3;
    raw.cachedTypes = raw.types;
    GameState.addToRoster(raw, stars);
    showToast(`✨ ${raw.name} (${starsHtml(stars)}) joined your roster!`);
    refreshCurrency();
  } catch {
    showToast('⚠️ Summon failed. Gems returned.');
    GameState.earnGems(20);
  }
}

function rollStars(type) {
  const r = Math.random();
  if (type === 'basic') {
    if (r < .10) return 3;
    if (r < .40) return 2;
    return 1;
  }
  if (type === 'premium') {
    if (r < .05) return 5;
    if (r < .20) return 4;
    if (r < .55) return 3;
    if (r < .90) return 2;
    return 1;
  }
  // x10 last guaranteed
  if (type === 'guaranteed') {
    if (r < .25) return 5;
    return 4;
  }
  return 1;
}

async function doSummon(type) {
  const st = GameState.get();
  if (type === 'basic') {
    if (!GameState.spendCoins(200)) { showToast('Not enough coins! 🪙'); return; }
  } else if (type === 'premium') {
    if (!GameState.spendGems(20)) { showToast('Not enough gems! 💎'); return; }
  } else if (type === 'x10') {
    if (!GameState.spendGems(180)) { showToast('Not enough gems! 💎'); return; }
  }
  refreshCurrency();

  const resultArea = document.getElementById('summon-result-area');
  if (resultArea) resultArea.innerHTML = `<div style="text-align:center;padding:20px"><div class="spinner" style="margin:0 auto"></div></div>`;

  const count  = type === 'x10' ? 10 : 1;
  const results = [];

  try {
    for (let i = 0; i < count; i++) {
      const id    = Math.floor(Math.random() * TOTAL_POKEMON) + 1;
      const stars = i === count - 1 && type === 'x10' ? rollStars('guaranteed') : rollStars(type);
      const raw   = await PokemonAPI.fetchRaw(id);
      GameState.addToRoster(raw, stars);
      results.push({ raw, stars });
    }

    if (!resultArea) return;

    if (count === 1) {
      const { raw, stars } = results[0];
      resultArea.innerHTML = `
        <div class="summon-result">
          <p style="font-size:.8rem;color:var(--text-muted)">You summoned…</p>
          <img src="${SPRITE(raw.id)}" alt="${raw.name}" />
          <p class="summon-result-name" style="text-transform:capitalize">${raw.name}</p>
          <p class="summon-result-stars">${starsHtml(stars)}</p>
          <div style="display:flex;gap:6px">${raw.types.map(typeChip).join('')}</div>
          <p style="font-size:.75rem;color:var(--text-muted)">Added to your roster!</p>
        </div>
      `;
    } else {
      const rows = results.map(({ raw, stars }) => `
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px;
                    background:var(--bg-card3);border-radius:8px">
          <img src="${SPRITE(raw.id)}" style="width:56px;height:56px;image-rendering:pixelated" />
          <span style="font-size:.7rem;text-transform:capitalize">${raw.name}</span>
          <span style="font-size:.7rem;color:var(--gold)">${starsHtml(stars)}</span>
        </div>
      `).join('');
      resultArea.innerHTML = `
        <div style="background:var(--bg-card2);border:1px solid var(--border);border-radius:var(--radius);padding:16px;animation:slideUp .4s ease">
          <p style="font-size:.9rem;font-weight:700;color:var(--gold);margin-bottom:12px">10× Summon Results!</p>
          <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px">${rows}</div>
        </div>
      `;
    }
    showToast(`✨ ${count > 1 ? `${count} champions` : results[0].raw.name} added to roster!`);
  } catch (err) {
    // Refund
    if (type === 'basic') GameState.earnCoins(200);
    else if (type === 'premium') GameState.earnGems(20);
    else if (type === 'x10') GameState.earnGems(180);
    refreshCurrency();
    if (resultArea) resultArea.innerHTML = `<p style="color:var(--red);padding:12px">⚠️ Summon failed. Currency refunded.</p>`;
    showToast('⚠️ Could not reach PokéAPI. Check connection.');
  }
}

/* ---- CHAMPION DETAIL ---- */
async function showChampDetail(rosterEntry) {
  openModal(`<div style="padding:40px;text-align:center"><div class="spinner" style="margin:0 auto"></div></div>`);
  try {
    const raw  = await PokemonAPI.fetchRaw(rosterEntry.id);
    const st   = GameState.get();
    const champ= PokemonAPI.buildChampion(raw, rosterEntry.level, rosterEntry.stars);
    const inTeam = st.team.includes(rosterEntry.id);

    const statMax = { hp:714, atk:526, def:526, spd:526 };
    const statsHtml = ['hp','atk','def','spd'].map(k => `
      <div class="stat-row">
        <span class="stat-name">${k.toUpperCase()}</span>
        <div class="stat-bar"><div class="stat-fill" style="width:${Math.min(100,(champ[k==='hp'?'maxHp':k]/statMax[k])*100)}%"></div></div>
        <span class="stat-val">${k === 'hp' ? champ.maxHp : champ[k]}</span>
      </div>
    `).join('');

    const skillsHtml = champ.skills.map(s => `
      <div class="skill-info-row" style="${skillColor(s.type)}">
        <span class="skill-info-name">${s.name} ${typeChip(s.type)}</span>
        <span class="skill-info-meta">Power ×${s.power} · CD ${s.cd} turns ${s.target === 'all' ? '· Hits All' : ''}</span>
      </div>
    `).join('');

    const canLevelUp = GameState.spendCoins(0) && st.coins >= rosterEntry.level * 50;

    openModal(`
      <div class="champ-detail">
        <div class="champ-detail-header">
          <img class="champ-detail-sprite" src="${SPRITE(rosterEntry.id)}" alt="${raw.name}" />
          <div class="champ-detail-info">
            <p class="champ-detail-name" style="text-transform:capitalize">${raw.name}</p>
            <p style="color:var(--gold);font-size:.9rem">${starsHtml(rosterEntry.stars)}</p>
            <p class="champ-detail-meta">Lv.${rosterEntry.level} · #${rosterEntry.id}</p>
            <div style="display:flex;gap:4px;margin-top:4px">${raw.types.map(typeChip).join('')}</div>
          </div>
        </div>

        <div style="padding:0 16px">
          <p class="section-label" style="margin-bottom:8px">Stats</p>
          ${statsHtml}
        </div>

        <div style="padding:0 16px">
          <p class="section-label" style="margin-bottom:8px">Skills</p>
          <div class="skills-grid">${skillsHtml}</div>
        </div>

        <div style="padding:0 16px 16px;display:flex;flex-direction:column;gap:8px">
          <button class="btn ${inTeam ? 'btn-red' : 'btn-gold'} btn-block"
                  onclick="toggleTeam(${rosterEntry.id});closeModal()">
            ${inTeam ? '❌ Remove from Team' : '⚔️ Add to Team'}
          </button>
          <button class="btn btn-purple btn-block"
                  id="btn-levelup-${rosterEntry.id}"
                  ${rosterEntry.level >= 100 ? 'disabled' : ''}>
            ⬆️ Level Up (${rosterEntry.level * 50} 🪙) — currently Lv.${rosterEntry.level}
          </button>
        </div>
      </div>
    `);

    document.getElementById(`btn-levelup-${rosterEntry.id}`)?.addEventListener('click', () => {
      const cost = rosterEntry.level * 50;
      if (!GameState.spendCoins(cost)) { showToast('Not enough coins!'); return; }
      GameState.levelUp(rosterEntry.id);
      refreshCurrency();
      closeModal();
      showToast(`${raw.name} is now Lv.${rosterEntry.level}!`);
    });

  } catch {
    openModal(`<div class="empty-state"><p>Could not load champion data.</p></div>`, true);
  }
}

function toggleTeam(id) {
  const st = GameState.get();
  if (st.team.includes(id)) {
    st.team = st.team.filter(x => x !== id);
    GameState.save();
  } else if (st.team.length < MAX_TEAM) {
    st.team.push(id);
    GameState.save();
    showToast('⚔️ Added to team!');
  } else {
    showToast(`Team is full (max ${MAX_TEAM})`);
  }
}

// ==============================================================================
// RAID / BATTLE FLOW
// ==============================================================================

async function startRaid(raidId) {
  const st   = GameState.get();
  const raid = RAID_DUNGEONS.find(r => r.id === raidId);
  if (!raid) return;

  if (st.team.length === 0) { showToast('⚠️ Add Pokémon to your team first!'); return; }
  if (!GameState.useEnergy(raid.energyCost)) {
    showToast(`⚡ Not enough energy! (need ${raid.energyCost})`); return;
  }
  refreshCurrency();

  // Build player team
  const loadingModal = `<div style="padding:40px;text-align:center"><div class="spinner" style="margin:0 auto"></div><p style="margin-top:16px;color:var(--text-muted)">Preparing battle…</p></div>`;
  openModal(loadingModal, true);

  try {
    _playerBuilt = [];
    for (const id of st.team) {
      const entry = st.rosterRaw.find(r => r.id === id);
      if (!entry) continue;
      const raw   = await PokemonAPI.fetchRaw(id);
      const champ = PokemonAPI.buildChampion(raw, entry.level, entry.stars, false);
      _playerBuilt.push(champ);
    }
    closeModal();
    _raidDef = raid;
    _waveIdx = 0;
    await startWave();
  } catch {
    closeModal();
    GameState.earnEnergy(raid.energyCost);
    showToast('⚠️ Could not start raid. Energy refunded.');
  }
}

async function startWave() {
  const waveDef = _raidDef.waves[_waveIdx];
  const enemyBuilt = [];

  for (const e of waveDef) {
    try {
      const raw  = await PokemonAPI.fetchRaw(e.id);
      const star = e.boss ? Math.min(6, Math.ceil(_raidDef.difficulty * 1.2)) : _raidDef.difficulty;
      const champ = PokemonAPI.buildChampion(raw, e.level, star, true);
      if (e.boss) { champ.maxHp = Math.floor(champ.maxHp * 2); champ.currentHp = champ.maxHp; }
      enemyBuilt.push(champ);
    } catch {
      // fallback stub
      enemyBuilt.push({
        uid: `e${e.id}`, id: e.id, name: `#${e.id}`, types: ['normal'],
        level: e.level, stars: 1, maxHp: 200, currentHp: 200,
        atk: 20, def: 15, spd: 15,
        skills: [{ name:'Tackle', power:1.0, type:'normal', effect:null, cd:0, cdLeft:0 }],
        status: null, buffs: {}, isEnemy: true, isPlayer: false,
      });
    }
  }

  // Restore player HP between waves (50% heal)
  _playerBuilt.forEach(p => {
    if (p.currentHp > 0) {
      p.currentHp = Math.min(p.maxHp, p.currentHp + Math.floor(p.maxHp * 0.5));
    }
  });

  _battle = new BattleEngine(
    _playerBuilt.filter(p => p.currentHp > 0),
    enemyBuilt,
    _raidDef.id
  );

  showScreen('battle');
  renderBattleScreen();
}

/* ---- BATTLE SCREEN ---- */
function renderBattleScreen() {
  const el = document.getElementById('screen-battle');
  el.innerHTML = `
    <div class="battle-screen">
      <div class="battle-header">
        <div class="flex flex-col" style="gap:2px">
          <span class="wave-label">Raid</span>
          <span class="wave-value">${_raidDef.name}</span>
        </div>
        <div class="flex flex-col" style="gap:2px;align-items:center">
          <span class="wave-label">Wave</span>
          <span class="wave-value">${_waveIdx + 1} / ${_raidDef.waves.length}</span>
        </div>
        <div class="turn-order" id="turn-order"></div>
      </div>

      <div class="battle-field" id="battle-field">
        <div class="enemy-area" id="enemy-area"></div>
        <div class="player-area" id="player-area"></div>
      </div>

      <div class="battle-log" id="battle-log">⚔️ Battle started!</div>

      <div class="skill-panel" id="skill-panel">
        <div class="skill-row" id="skill-row"></div>
        <button class="auto-btn" id="auto-btn">🤖 Auto Battle: OFF</button>
      </div>
    </div>
  `;

  document.getElementById('auto-btn').addEventListener('click', () => {
    _battle.autoPlay = !_battle.autoPlay;
    const btn = document.getElementById('auto-btn');
    btn.textContent = `🤖 Auto Battle: ${_battle.autoPlay ? 'ON' : 'OFF'}`;
    btn.className = `auto-btn ${_battle.autoPlay ? 'on' : ''}`;
    if (_battle.autoPlay) scheduleAutoTurn();
  });

  updateBattleUI();
  advanceTurnIfEnemy();
}

function updateBattleUI() {
  if (!_battle) return;

  // Turn order icons
  const toEl = document.getElementById('turn-order');
  if (toEl) {
    const order = _battle.turnOrderInfo;
    toEl.innerHTML = order.map((c, i) => {
      const isCur = i === 0 || c.uid === _battle.currentActor?.uid;
      return `
        <div class="turn-icon ${c.isEnemy ? 'enemy' : ''} ${isCur ? 'active-turn' : ''}">
          <img src="${SPRITE(c.id)}" alt="${c.name}" />
        </div>`;
    }).join('');
  }

  // Enemy area
  const eaEl = document.getElementById('enemy-area');
  if (eaEl) {
    eaEl.innerHTML = _battle.enemyChamps.map(c => `
      <div class="battle-pokemon" id="bpoke-${c.uid}">
        <img class="battle-sprite enemy ${c.currentHp<=0?'fainted':''} ${c.uid===_battle.currentActor?.uid?'active-fighter':''}"
             src="${SPRITE(c.id)}" alt="${c.name}" />
        <span class="battle-pokemon-name">${c.name}</span>
        ${statusIconHtml(c.status)}
        <div class="battle-hp">${hpBarHtml(c.currentHp, c.maxHp, true)}</div>
      </div>`).join('');
  }

  // Player area
  const paEl = document.getElementById('player-area');
  if (paEl) {
    paEl.innerHTML = _battle.playerChamps.map(c => `
      <div class="battle-pokemon" id="bpoke-${c.uid}">
        <img class="battle-sprite ${c.currentHp<=0?'fainted':''} ${c.uid===_battle.currentActor?.uid?'active-fighter':''}"
             src="${SPRITE(c.id)}" alt="${c.name}" />
        <span class="battle-pokemon-name">${c.name}</span>
        ${statusIconHtml(c.status)}
        <div class="battle-hp">${hpBarHtml(c.currentHp, c.maxHp, true)}</div>
      </div>`).join('');
  }

  updateSkillPanel();
}

function updateSkillPanel() {
  const actor = _battle?.currentActor;
  const panel = document.getElementById('skill-row');
  if (!panel) return;

  if (!actor || actor.isEnemy || _battle.over) {
    panel.innerHTML = `<p style="color:var(--text-muted);font-size:.8rem;grid-column:1/-1;text-align:center;padding:8px">
      ${_battle?.over ? '—' : 'Enemy turn…'}
    </p>`;
    return;
  }

  panel.innerHTML = actor.skills.map((s, i) => `
    <button class="skill-btn" style="${skillColor(s.type)}" data-idx="${i}"
            ${s.cdLeft > 0 ? 'disabled' : ''}>
      <span class="skill-btn-name">${s.name}</span>
      <span class="skill-btn-meta">
        ${typeChip(s.type)} ×${s.power}
        ${s.cd > 0 ? (s.cdLeft > 0 ? `⏳${s.cdLeft}` : `CD${s.cd}`) : ''}
        ${s.target === 'all' ? '· All' : ''}
      </span>
      ${s.cdLeft > 0 ? `<div class="skill-cd-bar" style="width:${(s.cdLeft/s.cd)*100}%"></div>` : ''}
    </button>
  `).join('');

  panel.querySelectorAll('.skill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (_battle.autoPlay) return;
      handlePlayerSkill(parseInt(btn.dataset.idx, 10));
    });
  });
}

function handlePlayerSkill(idx) {
  if (!_battle || _battle.over) return;
  const actor = _battle.currentActor;
  if (!actor || actor.isEnemy) return;

  const actions = _battle.playerAction(idx);
  animateActions(actions, () => {
    updateBattleUI();
    setBattleLog(_battle.log);
    if (_battle.over) {
      setTimeout(() => endBattle(), 800);
    } else {
      advanceTurnIfEnemy();
    }
  });
}

function advanceTurnIfEnemy() {
  if (!_battle || _battle.over) return;
  const actor = _battle.currentActor;
  if (!actor || actor.isPlayer) return;
  // It's enemy turn – pause then auto-play
  setTimeout(() => {
    if (!_battle || _battle.over) return;
    const actions = _battle.enemyAction();
    animateActions(actions, () => {
      updateBattleUI();
      setBattleLog(_battle.log);
      if (_battle.over) {
        setTimeout(() => endBattle(), 800);
      } else {
        advanceTurnIfEnemy(); // chain if next is also enemy
        if (_battle.autoPlay && !_battle.over) {
          const a = _battle.currentActor;
          if (a && a.isPlayer) scheduleAutoTurn();
        }
      }
    });
  }, 700);
}

function scheduleAutoTurn() {
  if (!_battle || _battle.over || !_battle.autoPlay) return;
  const actor = _battle.currentActor;
  if (!actor || actor.isEnemy) return;
  setTimeout(() => {
    if (!_battle || _battle.over || !_battle.autoPlay) return;
    // AI picks best skill
    const usable = actor.skills.filter(s => s.cdLeft === 0);
    const best   = usable.sort((a, b) => b.power - a.power)[0];
    if (!best) return;
    const idx = actor.skills.indexOf(best);
    handlePlayerSkill(idx);
  }, 500);
}

function setBattleLog(msg) {
  const el = document.getElementById('battle-log');
  if (el) el.textContent = msg;
}

function animateActions(actions, done) {
  if (!actions.length) { done(); return; }
  let i = 0;
  const step = () => {
    if (i >= actions.length) { done(); return; }
    const a = actions[i++];
    const targetEl = document.getElementById(`bpoke-${a.target}`);
    if (targetEl) {
      if (a.type === 'damage' || a.type === 'dot') {
        const float = document.createElement('div');
        float.className = `damage-float dmg-float`;
        let text = `-${a.amount}`;
        if (a.effectiveness > 1) text = `⚡${text} Super!`;
        if (a.effectiveness < 1 && a.effectiveness > 0) text = `${text} …`;
        if (a.crit) text = `💥${text} CRIT`;
        float.textContent = text;
        targetEl.style.position = 'relative';
        targetEl.appendChild(float);
        setTimeout(() => float.remove(), 950);
        // shake
        const sprite = targetEl.querySelector('.battle-sprite');
        if (sprite) { sprite.style.animation = 'shake .3s ease'; setTimeout(() => sprite.style.animation = '', 300); }
      } else if (a.type === 'miss') {
        const float = document.createElement('div');
        float.className = `damage-float miss-float`;
        float.textContent = 'Miss!';
        targetEl.appendChild(float);
        setTimeout(() => float.remove(), 950);
      } else if (a.type === 'heal') {
        const float = document.createElement('div');
        float.className = `damage-float heal-float`;
        float.textContent = `+${a.amount}`;
        targetEl.appendChild(float);
        setTimeout(() => float.remove(), 950);
      }
    }
    setTimeout(step, 200);
  };
  step();
}

async function endBattle() {
  if (_battle.playerWon) {
    // Check if more waves
    _waveIdx++;
    if (_waveIdx < _raidDef.waves.length) {
      showToast(`Wave ${_waveIdx} cleared! Get ready…`);
      setTimeout(() => startWave(), 1200);
      return;
    }
    // Raid complete
    const rewards = _raidDef.rewards;
    GameState.earnCoins(rewards.coins);
    GameState.earnGems(rewards.gems);
    GameState.markRaidComplete(_raidDef.id);
    // XP → level up random team member
    const st     = GameState.get();
    const member = st.rosterRaw.find(r => st.team.includes(r.id));
    if (member) GameState.levelUp(member.id);

    showScreen('result');
    renderResult(true, rewards);
  } else {
    showScreen('result');
    renderResult(false, null);
  }
}

function renderResult(won, rewards) {
  const el = document.getElementById('screen-result');
  el.innerHTML = `
    <div class="result-screen">
      <div class="result-title ${won ? 'win' : 'lose'}">${won ? '🏆 VICTORY!' : '💀 DEFEAT'}</div>
      ${won && rewards ? `
        <p style="color:var(--text-2);font-size:.9rem">Raid rewards collected!</p>
        <div class="result-reward-row">
          <div class="result-reward"><span class="result-reward-icon">🪙</span>+${rewards.coins}</div>
          <div class="result-reward"><span class="result-reward-icon">💎</span>+${rewards.gems}</div>
          <div class="result-reward"><span class="result-reward-icon">⭐</span>+${rewards.xp} XP</div>
        </div>
      ` : `
        <p style="color:var(--text-muted);font-size:.9rem">Your team was defeated. Train more champions!</p>
      `}
      <div style="display:flex;flex-direction:column;gap:10px;width:100%;max-width:280px">
        <button class="btn btn-gold btn-lg" id="btn-result-raid">
          ⚔️ Back to Raids
        </button>
        <button class="btn btn-ghost btn-block" id="btn-result-home">
          🏠 Main Menu
        </button>
      </div>
    </div>
  `;
  document.getElementById('btn-result-raid').addEventListener('click', () => { showScreen('hub'); renderHub('raids'); });
  document.getElementById('btn-result-home').addEventListener('click', () => { showScreen('hub'); renderHub(); });
  refreshCurrency();
}

// ==============================================================================
// APP BOOTSTRAP
// ==============================================================================
function initApp() {
  GameState.load();

  // Build static screen containers
  document.getElementById('app').innerHTML = `
    <div id="screen-title"    class="screen"></div>
    <div id="screen-starter"  class="screen"></div>
    <div id="screen-hub"      class="screen"></div>
    <div id="screen-battle"   class="screen"></div>
    <div id="screen-result"   class="screen"></div>
  `;

  // Restore modal/toast that was in original HTML
  if (!document.getElementById('toast')) {
    const t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t);
  }
  if (!document.getElementById('modal-overlay')) {
    const o = document.createElement('div'); o.id = 'modal-overlay'; o.className = 'modal-overlay hidden';
    o.innerHTML = '<div id="modal-box" class="modal-box"></div>';
    document.body.appendChild(o);
    o.addEventListener('click', e => { if (e.target === o) closeModal(); });
  }

  renderTitle();

  // Remove loading splash
  const splash = document.getElementById('loading-splash');
  if (splash) splash.remove();

  showScreen('title');

  // Passive energy regen: +1 every 3 minutes
  setInterval(() => {
    const st = GameState.get();
    if (st.energy < st.maxEnergy) { GameState.earnEnergy(1); refreshCurrency(); }
  }, 3 * 60 * 1000);
}

// Expose globals used by inline onclick handlers
window.closeModal       = closeModal;
window.toggleTeam       = toggleTeam;
window.doDirectSummon   = doDirectSummon;

// Start
document.addEventListener('DOMContentLoaded', initApp);
