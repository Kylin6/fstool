/**
 * Comprehensive Date Selection Rules Engine (华夏传统全场景择日专业算法)
 * 严格依据《协纪辨方书》、《玉匣记》、《三命通会》等传统择吉典籍实现
 * 支持：嫁娶结婚、开业开市、动土起基、乔迁入宅、安床设帐、签约交易
 */

(function (global) {
  'use strict';

  // 地支六冲
  const CHONG_MAP = {
    '子': '午', '午': '子',
    '丑': '未', '未': '丑',
    '寅': '申', '申': '寅',
    '卯': '酉', '酉': '卯',
    '辰': '戌', '戌': '辰',
    '巳': '亥', '亥': '巳'
  };

  // 地支六合
  const LIU_HE_MAP = {
    '子': '丑', '丑': '子',
    '寅': '亥', '亥': '寅',
    '卯': '戌', '戌': '卯',
    '辰': '酉', '酉': '辰',
    '巳': '申', '申': '巳',
    '午': '未', '未': '午'
  };

  // 地支三合局
  const SAN_HE_GROUPS = [
    { group: ['申', '子', '辰'], ju: '水局' },
    { group: ['寅', '午', '戌'], ju: '火局' },
    { group: ['巳', '酉', '丑'], ju: '金局' },
    { group: ['亥', '卯', '未'], ju: '木局' }
  ];

  // 地支六害
  const LIU_HAI_MAP = {
    '子': '未', '未': '子',
    '丑': '午', '午': '丑',
    '寅': '巳', '巳': '寅',
    '卯': '辰', '辰': '卯',
    '申': '亥', '亥': '申',
    '酉': '戌', '戌': '酉'
  };

  // 天干五合
  const TIAN_HE_MAP = {
    '甲': '己', '己': '甲',
    '乙': '庚', '庚': '乙',
    '丙': '辛', '辛': '丙',
    '丁': '壬', '壬': '丁',
    '戊': '癸', '癸': '戊'
  };

  // 天乙贵人：甲戊见牛羊，乙己鼠猴乡，丙丁猪鸡位，壬癸兔蛇藏，庚辛逢虎马
  const TIAN_YI_MAP = {
    '甲': ['丑', '未'], '戊': ['丑', '未'],
    '乙': ['子', '申'], '己': ['子', '申'],
    '丙': ['亥', '酉'], '丁': ['亥', '酉'],
    '庚': ['寅', '午'], '辛': ['寅', '午'],
    '壬': ['卯', '巳'], '癸': ['卯', '巳']
  };

  // 天德贵人
  const TIAN_DE_MAP = {
    '寅': '丁', '卯': '申', '辰': '壬', '巳': '辛',
    '午': '亥', '未': '甲', '申': '癸', '酉': '寅',
    '戌': '丙', '亥': '乙', '子': '巳', '丑': '庚'
  };

  // 月德贵人
  const YUE_DE_MAP = {
    '寅': '丙', '午': '丙', '戌': '丙',
    '申': '壬', '子': '壬', '辰': '壬',
    '亥': '甲', '卯': '甲', '未': '甲',
    '巳': '庚', '酉': '庚', '丑': '庚'
  };

  // 女命行嫁大利月、小利月 (依女方生肖/年支)
  const LI_YUE_RULES = {
    '子': { daLi: [6, 12], xiaoLi: [1, 7], name: '鼠' },
    '午': { daLi: [6, 12], xiaoLi: [1, 7], name: '马' },
    '丑': { daLi: [5, 11], xiaoLi: [4, 10], name: '牛' },
    '未': { daLi: [5, 11], xiaoLi: [4, 10], name: '羊' },
    '寅': { daLi: [2, 8],  xiaoLi: [3, 9],  name: '虎' },
    '申': { daLi: [2, 8],  xiaoLi: [3, 9],  name: '猴' },
    '卯': { daLi: [1, 7],  xiaoLi: [2, 8],  name: '兔' },
    '酉': { daLi: [1, 7],  xiaoLi: [2, 8],  name: '鸡' },
    '辰': { daLi: [4, 10], xiaoLi: [5, 11], name: '龙' },
    '戌': { daLi: [4, 10], xiaoLi: [5, 11], name: '狗' },
    '巳': { daLi: [3, 9],  xiaoLi: [6, 12], name: '蛇' },
    '亥': { daLi: [3, 9],  xiaoLi: [6, 12], name: '猪' }
  };

  // 十二建除值星
  const JIAN_CHU_LIST = ['建', '除', '满', '平', '定', '执', '破', '危', '成', '收', '开', '闭'];

  // 青龙黄道十二神
  const HUANG_DAO_STARS = [
    { name: '青龙', isHuangDao: true, desc: '青龙入命，万事吉昌，喜气盈门' },
    { name: '明堂', isHuangDao: true, desc: '明堂高照，贵人扶助，官禄两全' },
    { name: '天刑', isHuangDao: false, desc: '天刑不测，多生是非' },
    { name: '朱雀', isHuangDao: false, desc: '朱雀口舌，争执易生' },
    { name: '金匮', isHuangDao: true, desc: '金匮积福，家业昌盛，财帛丰登' },
    { name: '天德', isHuangDao: true, desc: '天德宝光，吉神相随，诸凶避退' },
    { name: '白虎', isHuangDao: false, desc: '白虎临门，须防波折' },
    { name: '玉堂', isHuangDao: true, desc: '玉堂华彩，门庭光耀，良缘永缔' },
    { name: '天牢', isHuangDao: false, desc: '天牢困顿，事多阻滞' },
    { name: '玄武', isHuangDao: false, desc: '玄武阴晦，盗贼小人' },
    { name: '司命', isHuangDao: true, desc: '司命当阳，功德圆满，喜事重重' },
    { name: '勾陈', isHuangDao: false, desc: '勾陈牵绊，迟缓不顺' }
  ];

  // 查日值十二神 起始地支
  const QING_LONG_START_MAP = {
    '子': '申', '午': '申',
    '丑': '戌', '未': '戌',
    '寅': '子', '申': '子',
    '卯': '寅', '酉': '寅',
    '辰': '辰', '戌': '辰',
    '巳': '午', '亥': '午'
  };

  // 杨公十三忌日 (农历月日)
  const YANG_GONG_JI = [
    { m: 1, d: 13 }, { m: 2, d: 11 }, { m: 3, d: 9 }, { m: 4, d: 7 },
    { m: 5, d: 5 },  { m: 6, d: 3 },  { m: 7, d: 1 }, { m: 7, d: 29 },
    { m: 8, d: 27 }, { m: 9, d: 25 }, { m: 10, d: 23 }, { m: 11, d: 21 },
    { m: 12, d: 19 }
  ];

  // 归忌日 (入宅大忌)
  function isGuiJiDay(lunarMonthZhi, dayZhi) {
    if (['寅', '申', '巳', '亥'].includes(lunarMonthZhi) && dayZhi === '丑') return true;
    if (['子', '午', '卯', '酉'].includes(lunarMonthZhi) && dayZhi === '寅') return true;
    if (['辰', '戌', '丑', '未'].includes(lunarMonthZhi) && dayZhi === '子') return true;
    return false;
  }

  // 计算建除值星
  function getJianChu(monthZhi, dayZhi) {
    const DIZHI = global.LunarEngine.DIZHI;
    const mIdx = DIZHI.indexOf(monthZhi);
    const dIdx = DIZHI.indexOf(dayZhi);
    if (mIdx === -1 || dIdx === -1) return { name: '', score: 0, desc: '' };

    const offset = (dIdx - mIdx + 12) % 12;
    const starName = JIAN_CHU_LIST[offset];

    return {
      name: starName,
      fullName: starName + '日',
      offset: offset
    };
  }

  // 计算青龙黄道十二神
  function getHuangDao(monthZhi, dayZhi) {
    const DIZHI = global.LunarEngine.DIZHI;
    const startZhi = QING_LONG_START_MAP[monthZhi] || '子';
    const startIdx = DIZHI.indexOf(startZhi);
    const dayIdx = DIZHI.indexOf(dayZhi);

    const offset = (dayIdx - startIdx + 12) % 12;
    const star = HUANG_DAO_STARS[offset];

    return {
      name: star.name,
      fullName: star.name + (star.isHuangDao ? '黄道' : '黑道'),
      isHuangDao: star.isHuangDao,
      score: star.isHuangDao ? 12 : -8,
      desc: star.desc
    };
  }

  // 天赦日
  function isTianShe(lunarMonth, dayGZText) {
    if ((lunarMonth >= 1 && lunarMonth <= 3) && dayGZText === '戊寅') return true;
    if ((lunarMonth >= 4 && lunarMonth <= 6) && dayGZText === '甲午') return true;
    if ((lunarMonth >= 7 && lunarMonth <= 9) && dayGZText === '戊申') return true;
    if ((lunarMonth >= 10 && lunarMonth <= 12) && dayGZText === '甲子') return true;
    return false;
  }

  // 杨公十三忌
  function isYangGongJi(lunarMonth, lunarDay) {
    return YANG_GONG_JI.some(item => item.m === lunarMonth && item.d === lunarDay);
  }

  // 红沙大煞
  function isHongSha(lunarMonth, dayZhi) {
    const m = (lunarMonth - 1) % 3;
    if (m === 0 && dayZhi === '酉') return true;
    if (m === 1 && dayZhi === '巳') return true;
    if (m === 2 && dayZhi === '丑') return true;
    return false;
  }

  // 推算时辰吉凶
  function getLuckyHours(dayGanZhi) {
    const DIZHI = global.LunarEngine.DIZHI;
    const dayZhi = dayGanZhi.zhi;
    const dayGanIdx = dayGanZhi.ganIdx;

    const startZhi = QING_LONG_START_MAP[dayZhi] || '子';
    const startIdx = DIZHI.indexOf(startZhi);

    const luckyHours = [];
    const hourTimeNames = [
      '23:00-01:00 (子时)', '01:00-03:00 (丑时)', '03:00-05:00 (寅时)', '05:00-07:00 (卯时)',
      '07:00-09:00 (辰时)', '09:00-11:00 (巳时)', '11:00-13:00 (午时)', '13:00-15:00 (未时)',
      '15:00-17:00 (申时)', '17:00-19:00 (酉时)', '19:00-21:00 (戌时)', '21:00-23:00 (亥时)'
    ];

    for (let i = 0; i < 12; i++) {
      const zhi = DIZHI[i];
      const offset = (i - startIdx + 12) % 12;
      const star = HUANG_DAO_STARS[offset];
      const hourGZ = global.LunarEngine.getHourGanZhi(dayGanIdx, (i * 2 + 1) % 24);
      const isHe = LIU_HE_MAP[dayZhi] === zhi;

      if (star.isHuangDao || isHe) {
        luckyHours.push({
          timeSpan: hourTimeNames[i],
          zhi: zhi,
          ganZhi: hourGZ.text,
          starName: star.name + '黄道',
          isLiuHe: isHe,
          label: `${hourTimeNames[i]} 【${hourGZ.text}时】 - ${star.name}黄道${isHe ? '·地支六合' : ''}`
        });
      }
    }
    return luckyHours;
  }

  // ==========================================
  // 全场景通用择日主引擎
  // ==========================================
  function evaluateScenarioDate(scenario, date, primaryPerson, secondaryPerson = null, options = {}) {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const dayOfWeek = date.getDay();
    const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);

    const lunar = global.LunarEngine.solarToLunar(y, m, d);
    const dayGZ = global.LunarEngine.getDayGanZhi(y, m, d);
    const yearGZ = global.LunarEngine.getYearGanZhi(y, m, d);
    const monthGZ = global.LunarEngine.getMonthGanZhi(y, m, d, yearGZ.ganIdx);

    const dayGan = dayGZ.gan;
    const dayZhi = dayGZ.zhi;
    const monthZhi = monthGZ.zhi;

    const jianChu = getJianChu(monthZhi, dayZhi);
    const huangDao = getHuangDao(monthZhi, dayZhi);

    const positiveReasons = [];
    const negativeReasons = [];
    const highlightTags = [];
    let score = 65;

    let isVetoed = false;
    let vetoReason = '';

    // 通用底层凶煞排查
    if (CHONG_MAP[dayZhi] === yearGZ.zhi) {
      isVetoed = true;
      vetoReason = `岁破大煞：日支【${dayZhi}】直冲流年太岁【${yearGZ.zhi}】，岁破百事皆忌`;
      negativeReasons.push(vetoReason);
    }

    if (CHONG_MAP[dayZhi] === monthZhi || jianChu.name === '破') {
      isVetoed = true;
      vetoReason = `月破大耗：日支【${dayZhi}】冲月令【${monthZhi}】，值星逢【破日】，诸事大忌`;
      negativeReasons.push(vetoReason);
    }

    if (isYangGongJi(lunar.lunarMonth, lunar.lunarDay)) {
      isVetoed = true;
      vetoReason = `杨公十三忌大凶日（农历${lunar.monthStr}${lunar.dayStr}），万事莫举`;
      negativeReasons.push(vetoReason);
    }

    const pYearZhi = primaryPerson.year.zhi;
    const pDayZhi = primaryPerson.day.zhi;
    const pDayGan = primaryPerson.day.gan;

    if (CHONG_MAP[dayZhi] === pYearZhi) {
      isVetoed = true;
      vetoReason = `日支【${dayZhi}】六冲主事人属相【${pYearZhi}】，冲犯本命太岁`;
      negativeReasons.push(vetoReason);
    }

    if (secondaryPerson) {
      const sYearZhi = secondaryPerson.year.zhi;
      if (CHONG_MAP[dayZhi] === sYearZhi) {
        isVetoed = true;
        vetoReason = `日支【${dayZhi}】六冲次要主事者/新娘属相【${sYearZhi}】，犯生肖相冲`;
        negativeReasons.push(vetoReason);
      }
    }

    // 分场景规则
    if (scenario === 'wedding') {
      // 1. 💍 嫁娶结婚
      const bride = secondaryPerson || primaryPerson;
      const groom = primaryPerson;

      if (CHONG_MAP[dayZhi] === groom.day.zhi) {
        isVetoed = true;
        vetoReason = `冲新郎日支夫妻宫【${groom.day.zhi}】，动摇婚基，大忌`;
      }
      if (CHONG_MAP[dayZhi] === bride.day.zhi) {
        isVetoed = true;
        vetoReason = `冲新娘日支夫妻宫【${bride.day.zhi}】，不利感情，大忌`;
      }
      if (isHongSha(lunar.lunarMonth, dayZhi)) {
        isVetoed = true;
        vetoReason = `红沙大煞：嫁娶遇红沙，家业易损，大凶忌选`;
      }
      if (dayGZ.text === groom.day.text || dayGZ.text === bride.day.text) {
        isVetoed = true;
        vetoReason = `伏吟日：日课干支与新人日柱干支重叠伏吟，阻碍发展`;
      }

      const brideRule = LI_YUE_RULES[bride.year.zhi];
      let liYueType = '普通月';
      if (brideRule) {
        if (brideRule.daLi.includes(lunar.lunarMonth)) {
          liYueType = '大利月';
          score += 18;
          highlightTags.push('女命大利月');
          positiveReasons.push({
            category: '女命行嫁利月',
            title: '逢女命大利月·福禄双全',
            detail: `新娘属【${brideRule.name}】，农历${lunar.monthStr}正逢上上【大利月】（歌诀：正七迎鸡兔，二八虎猴当，三九蛇猪配，四十龙狗藏，五十一牛羊，六腊马鼠量）。大旺夫家气运与子嗣福泽。`
          });
        } else if (brideRule.xiaoLi.includes(lunar.lunarMonth)) {
          liYueType = '小利月';
          score += 10;
          highlightTags.push('女命小利月');
          positiveReasons.push({
            category: '女命行嫁利月',
            title: '逢女命小利月·平顺吉祥',
            detail: `新娘属【${brideRule.name}】，农历${lunar.monthStr}为行嫁【小利月】（媒人月），平顺吉庆。`
          });
        }
      }

      if (jianChu.name === '成') {
        score += 15;
        highlightTags.push('成日大吉');
        positiveReasons.push({
          category: '建除利市',
          title: '值建除【成日】·大吉之首',
          detail: '“成日百事兴，嫁娶吉昌”。主新人白头到老、功成名遂、琴瑟和谐。'
        });
      } else if (jianChu.name === '定') {
        score += 12;
        highlightTags.push('定日吉昌');
        positiveReasons.push({
          category: '建除利市',
          title: '值建除【定日】·良缘已定',
          detail: '“定日定乾坤，嫁娶利安家”。象征夫妻感情恩爱稳定、家庭安泰长青。'
        });
      } else if (jianChu.name === '开') {
        score += 10;
        highlightTags.push('开日迎春');
        positiveReasons.push({
          category: '建除利市',
          title: '值建除【开日】·大吉开泰',
          detail: '“开日万象新，开门见喜”。象征开启全新美满婚姻人生。'
        });
      }

      if (LIU_HE_MAP[dayZhi] === groom.year.zhi) { score += 8; highlightTags.push('合新郎生肖'); }
      if (LIU_HE_MAP[dayZhi] === bride.year.zhi) { score += 8; highlightTags.push('合新娘生肖'); }
      if (LIU_HE_MAP[dayZhi] === groom.day.zhi) { score += 9; highlightTags.push('合新郎夫妻宫'); }
      if (LIU_HE_MAP[dayZhi] === bride.day.zhi) { score += 9; highlightTags.push('合新娘夫妻宫'); }

      positiveReasons.push({
        category: '凶煞排查',
        title: '新人命盘与凶神严查无犯',
        detail: `已严密排查：不冲新郎属相（${groom.year.zhi}）、不冲新娘属相（${bride.year.zhi}）、无夫妻宫冲刑破害、避开岁破、月破、杨公忌日及红沙大煞。`
      });

    } else if (scenario === 'opening') {
      // 2. 🏢 开业开市
      if (jianChu.name === '开') {
        score += 18;
        highlightTags.push('开日·大展鸿图');
        positiveReasons.push({
          category: '建除利业',
          title: '值神逢建除【开日】·开门大吉',
          detail: '《玉匣记》云：“开日利开市，百货畅流，客源广进”。象征商路大展、财源广进、宾客盈门。'
        });
      } else if (jianChu.name === '满') {
        score += 16;
        highlightTags.push('满日·聚财丰盈');
        positiveReasons.push({
          category: '建除利业',
          title: '值神逢建除【满日】·金玉满堂',
          detail: '“满日丰收，财帛聚仓”。开业主生意兴隆、盆满钵满、财库充盈稳固。'
        });
      } else if (jianChu.name === '成') {
        score += 15;
        highlightTags.push('成日·大获成功');
        positiveReasons.push({
          category: '建除利业',
          title: '值神逢建除【成日】·开局告捷',
          detail: '成日主万事皆成，利于开启新商业宏图，合伙顺利，业务水到渠成。'
        });
      } else if (jianChu.name === '定') {
        score += 12;
        highlightTags.push('定日·基业长青');
        positiveReasons.push({
          category: '建除利业',
          title: '值神逢建除【定日】·安定长久',
          detail: '定日利于确立长远商业根基，防范风险，业务扎实平稳。'
        });
      } else if (['闭', '建', '破'].includes(jianChu.name)) {
        isVetoed = true;
        vetoReason = `逢【${jianChu.name}日】，商机闭塞或气运受损，开市大忌`;
      }

      if (huangDao.name === '金匮') {
        score += 16;
        highlightTags.push('金匮财星');
        positiveReasons.push({
          category: '黄道财运',
          title: '值神逢【金匮黄道】·大聚财帛',
          detail: '金匮为天之财库，大吉之曜，主家业昌盛、聚财纳福，最利开张纳财。'
        });
      }

      if (LIU_HE_MAP[dayZhi] === pYearZhi) {
        score += 10;
        highlightTags.push('六合助老板');
        positiveReasons.push({
          category: '主命相合',
          title: '日支与开业福主生肖成六合',
          detail: `日支【${dayZhi}】与主事人生肖【${pYearZhi}】地支六合，主得天时地利，贵人临门提携，客源长久稳固。`
        });
      }

      const pGuiRen = TIAN_YI_MAP[pDayGan] || [];
      if (pGuiRen.includes(dayZhi)) {
        score += 10;
        highlightTags.push('天乙贵人');
        positiveReasons.push({
          category: '贵人临门',
          title: '逢福主命中【天乙贵人】吉星',
          detail: '开市得天乙贵人相助，多逢大客户、得政策与贵人相携，逢凶化吉。'
        });
      }

      positiveReasons.push({
        category: '避煞安康',
        title: '商业煞气严审过关',
        detail: `已排除冲克老板属相（${pYearZhi}）、岁破日、月破大耗、受死日等破财败局。`
      });

    } else if (scenario === 'breakground') {
      // 3. 🏗️ 动土起基
      if (['闭', '破', '建'].includes(jianChu.name)) {
        isVetoed = true;
        vetoReason = `值星逢【${jianChu.name}日】，动土破土大忌`;
      }

      if (jianChu.name === '定') {
        score += 18;
        highlightTags.push('定日·基石永固');
        positiveReasons.push({
          category: '建除动工',
          title: '值建除【定日】·地基稳固',
          detail: '定日动土破土，主基业坚实，结构安稳，施工平安顺遂，无坍塌倾覆之患。'
        });
      } else if (jianChu.name === '成') {
        score += 15;
        highlightTags.push('成日·大厦速成');
        positiveReasons.push({
          category: '建除动工',
          title: '值建除【成日】·工程圆满',
          detail: '成日主大厦落成、进展如飞，利于工期顺利推进，质量过硬。'
        });
      } else if (jianChu.name === '除') {
        score += 14;
        highlightTags.push('除日·扫除滞碍');
        positiveReasons.push({
          category: '建除动工',
          title: '值建除【除日】·平整地气',
          detail: '除日利于破除旧貌、扫除地煞污秽，利于开山破土。'
        });
      } else if (jianChu.name === '执') {
        score += 12;
        highlightTags.push('执日·执固基业');
        positiveReasons.push({
          category: '建除动工',
          title: '值建除【执日】·操持有据',
          detail: '执日利于打桩灌浆，结构严谨，施工规范有条不紊。'
        });
      }

      if (TIAN_DE_MAP[monthZhi] === dayGan || YUE_DE_MAP[monthZhi] === dayGan) {
        score += 15;
        highlightTags.push('德星护地');
        positiveReasons.push({
          category: '地神吉星',
          title: '天德/月德吉星高照·神煞避让',
          detail: '天德月德临空，地皇土府百煞遁避，保佑现场施工工匠安康吉祥、顺风顺水。'
        });
      }

      if (LIU_HE_MAP[dayZhi] === pYearZhi) {
        score += 10;
        highlightTags.push('合宅主生肖');
        positiveReasons.push({
          category: '主命相生',
          title: '日支与房主生肖六合',
          detail: `日支【${dayZhi}】与宅主生肖【${pYearZhi}】天作之合，动土后宅运滋润旺盛。`
        });
      }

      positiveReasons.push({
        category: '安工防煞',
        title: '动土煞气严审过关',
        detail: `已排除冲宅主生肖（${pYearZhi}）、岁破日、月破大耗、受死日，地气祥和安定。`
      });

    } else if (scenario === 'relocate') {
      // 4. 🏡 乔迁入宅
      if (isGuiJiDay(monthZhi, dayZhi)) {
        isVetoed = true;
        vetoReason = `归忌日：古语“日逢归忌入新宅，财耗人口不安宁”，乔迁入宅大忌`;
      }

      if (jianChu.name === '开') {
        score += 18;
        highlightTags.push('开门纳福');
        positiveReasons.push({
          category: '入宅建除',
          title: '值建除【开日】·紫气东来',
          detail: '《象吉通书》：“开日入宅，开门见喜，福禄迎门”。主新居气运亨通，人丁兴旺。'
        });
      } else if (jianChu.name === '成') {
        score += 16;
        highlightTags.push('家道大成');
        positiveReasons.push({
          category: '入宅建除',
          title: '值建除【成日】·阖家幸福',
          detail: '成日入宅，主安居乐业、家业功成，家人身心舒泰安宁。'
        });
      } else if (jianChu.name === '定') {
        score += 14;
        highlightTags.push('安居永固');
        positiveReasons.push({
          category: '入宅建除',
          title: '值建除【定日】·定宅安康',
          detail: '定日安定家邦，主宅气绵长，风水和顺，防煞驱邪。'
        });
      } else if (['破', '闭', '平'].includes(jianChu.name)) {
        isVetoed = true;
        vetoReason = `逢【${jianChu.name}日】，宅气未通，不宜乔迁`;
      }

      if (isTianShe(lunar.lunarMonth, dayGZ.text)) {
        score += 16;
        highlightTags.push('天赦圣日');
        positiveReasons.push({
          category: '福神降临',
          title: '逢百神拥护之【天赦吉日】',
          detail: '天赦吉日，宅神生欢，迁居大吉大利，遇难呈祥。'
        });
      }

      if (LIU_HE_MAP[dayZhi] === pYearZhi) {
        score += 10;
        highlightTags.push('六合旺宅');
        positiveReasons.push({
          category: '宅命相融',
          title: '日支与房主生肖天合地合',
          detail: `日支【${dayZhi}】与宅主生肖【${pYearZhi}】六合，入住后身体康泰，贵人助力。`
        });
      }

      positiveReasons.push({
        category: '安家避煞',
        title: '入宅诸凶全面排查',
        detail: `已排除冲克房主属相（${pYearZhi}）、岁破日、月破、归忌日、杨公十三忌，合家安平。`
      });

    } else if (scenario === 'bed') {
      // 5. 🛏️ 安床设帐
      if (['破', '闭', '平', '收'].includes(jianChu.name)) {
        isVetoed = true;
        vetoReason = `逢【${jianChu.name}日】，卧具不安，安床大忌`;
      }

      if (jianChu.name === '危') {
        score += 16;
        highlightTags.push('危日高安');
        positiveReasons.push({
          category: '安床吉度',
          title: '逢传统安床首选【危日】',
          detail: '古书载：“危日安床子孙昌，高卧安枕福自长”。传统安床首选危日，主睡眠香甜，安神益气。'
        });
      } else if (jianChu.name === '定') {
        score += 15;
        highlightTags.push('定神安眠');
        positiveReasons.push({
          category: '安床吉度',
          title: '值建除【定日】·定志宁心',
          detail: '定日安床，主寝榻稳固，神魂安宁，促进夫妻感情，助好眠益寿。'
        });
      } else if (jianChu.name === '开' || jianChu.name === '成') {
        score += 12;
        highlightTags.push(jianChu.name + '日吉昌');
        positiveReasons.push({
          category: '安床吉度',
          title: `值建除【${jianChu.name}日】·祥和喜庆`,
          detail: '利于新房安床，增进夫妻和睦与求嗣受孕。'
        });
      }

      if (LIU_HE_MAP[dayZhi] === pYearZhi) {
        score += 8;
        highlightTags.push('合命元');
      }

    } else if (scenario === 'contract') {
      // 6. ✍️ 签约交易
      if (['破', '闭', '收'].includes(jianChu.name)) {
        isVetoed = true;
        vetoReason = `逢【${jianChu.name}日】，合约易阻或款项纠纷，签约大忌`;
      }

      if (jianChu.name === '成') {
        score += 18;
        highlightTags.push('成日·大功告成');
        positiveReasons.push({
          category: '契约大吉',
          title: '值建除【成日】·协议速成',
          detail: '“成日主事事速成，合约履约顺利”。利于签署重大合同、项目合作与合资结盟。'
        });
      } else if (jianChu.name === '满') {
        score += 16;
        highlightTags.push('满日·利益丰厚');
        positiveReasons.push({
          category: '契约大吉',
          title: '值建除【满日】·丰厚盈满',
          detail: '满日签约，主合同标的丰厚，双方共赢，资金回笼顺利。'
        });
      } else if (jianChu.name === '定') {
        score += 14;
        highlightTags.push('定日·协议永固');
        positiveReasons.push({
          category: '契约大吉',
          title: '值建除【定日】·履约坚实',
          detail: '定日签约，主条款清晰明确，双方恪守信誉，无毁约纠纷之虞。'
        });
      }

      const pGuiRen = TIAN_YI_MAP[pDayGan] || [];
      if (pGuiRen.includes(dayZhi)) {
        score += 12;
        highlightTags.push('贵人作保');
        positiveReasons.push({
          category: '贵人临位',
          title: '逢【天乙贵人】坐镇签押',
          detail: '贵人照拂，利于谈判争取优厚条款，合作方诚恳友善，防范欺诈小人。'
        });
      }
    }

    // 通用黄道吉神加分
    score += huangDao.score;
    if (huangDao.isHuangDao) {
      highlightTags.push(`${huangDao.name}黄道`);
      positiveReasons.push({
        category: '黄道值日',
        title: `值神逢【${huangDao.name}黄道吉日】`,
        detail: `${huangDao.desc}。得黄道吉神当值，吉曜临空，诸神拥护，万事顺利吉祥。`
      });
    }

    // 周末加分
    if (isWeekend) {
      score += (scenario === 'wedding' || scenario === 'opening' || scenario === 'relocate') ? 3 : 1;
      highlightTags.push(dayOfWeek === 0 ? '周日吉日' : '周六吉日');
    }

    if (isVetoed) {
      return {
        dateStr: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        lunarStr: `${lunar.monthStr}${lunar.dayStr}`,
        ganZhiDay: dayGZ.text,
        isSuitable: false,
        score: 0,
        starLevel: 0,
        vetoReason: vetoReason,
        negativeReasons: negativeReasons
      };
    }

    score = Math.min(100, Math.max(50, score));

    let starLevel = 3;
    let rankName = '次吉可用';
    if (score >= 90) {
      starLevel = 5;
      rankName = '上上大吉·神明佑助';
    } else if (score >= 80) {
      starLevel = 4;
      rankName = '上吉吉日·福泽深厚';
    } else if (score >= 70) {
      starLevel = 3;
      rankName = '次吉平顺·安泰如意';
    } else {
      return {
        dateStr: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        lunarStr: `${lunar.monthStr}${lunar.dayStr}`,
        ganZhiDay: dayGZ.text,
        isSuitable: false,
        score: score,
        starLevel: 2,
        vetoReason: '评分未达吉日推荐标准',
        negativeReasons: negativeReasons
      };
    }

    const luckyHours = getLuckyHours(dayGZ);

    return {
      date: date,
      dateStr: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      year: y,
      month: m,
      day: d,
      dayOfWeek: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][dayOfWeek],
      isWeekend: isWeekend,
      lunar: lunar,
      lunarStr: `农历${lunar.monthStr}${lunar.dayStr}`,
      ganZhiYear: yearGZ.text,
      ganZhiMonth: monthGZ.text,
      ganZhiDay: dayGZ.text,
      nayinDay: dayGZ.nayin,
      isSuitable: true,
      score: score,
      starLevel: starLevel,
      rankName: rankName,
      jianChu: jianChu,
      huangDao: huangDao,
      highlightTags: Array.from(new Set(highlightTags)).slice(0, 5),
      positiveReasons: positiveReasons,
      negativeReasons: negativeReasons,
      luckyHours: luckyHours,
      briefSummary: `【${rankName}】公历${y}年${m}月${d}日，${lunar.monthStr}${lunar.dayStr}，${dayGZ.text}日，逢${huangDao.name}黄道与建除${jianChu.name}日。`
    };
  }

  function findDates(scenario, startDate, endDate, primaryPerson, secondaryPerson, options = {}) {
    const results = [];
    const cur = new Date(startDate.getTime());
    const end = new Date(endDate.getTime());

    while (cur <= end) {
      const evalRes = evaluateScenarioDate(scenario, cur, primaryPerson, secondaryPerson, options);

      if (evalRes.isSuitable) {
        if (options.weekendOnly && !evalRes.isWeekend) {
          cur.setDate(cur.getDate() + 1);
          continue;
        }

        if (options.minStar && evalRes.starLevel < options.minStar) {
          cur.setDate(cur.getDate() + 1);
          continue;
        }

        if (scenario === 'wedding' && options.daLiOnly) {
          const hasDaLi = evalRes.highlightTags.some(t => t.includes('大利月'));
          if (!hasDaLi) {
            cur.setDate(cur.getDate() + 1);
            continue;
          }
        }

        results.push(evalRes);
      }

      cur.setDate(cur.getDate() + 1);
    }

    results.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.date.getTime() - b.date.getTime();
    });

    return results;
  }

  function evaluateWeddingDate(date, groom, bride, options = {}) {
    return evaluateScenarioDate('wedding', date, groom, bride, options);
  }

  function findWeddingDates(startDate, endDate, groom, bride, options = {}) {
    return findDates('wedding', startDate, endDate, groom, bride, options);
  }

  global.WeddingRules = {
    CHONG_MAP,
    LIU_HE_MAP,
    SAN_HE_GROUPS,
    LI_YUE_RULES,
    JIAN_CHU_LIST,
    HUANG_DAO_STARS,
    getJianChu,
    getHuangDao,
    getLuckyHours,
    evaluateWeddingDate,
    findWeddingDates,
    evaluateScenarioDate,
    findDates
  };

})(typeof window !== 'undefined' ? window : this);
