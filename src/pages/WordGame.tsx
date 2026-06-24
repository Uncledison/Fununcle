// @ts-nocheck
import { useState, useRef, useCallback, useEffect, useLayoutEffect } from "react";
import { usePageSeo } from "../hooks/usePageSeo";
import { speak } from "../lib/pronunciation";

// ── 단어 데이터 (교육부 고시 제2022-33호 [별책 14]) ────────────────
const WORLDS = [
  {
    id:1, title:"자연의 땅", emoji:"🌿",
    color:"#4ADE80", dark:"#15803d",
    desc:"초등 필수 단어 1~100번",
    words:[
      {en:"a",ko:"하나의",tip:"하나의 개체(a)"}, {en:"about",ko:"~에 대하여",tip:"a+bout(주위): 주위에"}, {en:"above",ko:"~의 위에",tip:"a+bove(위): 더 위에"}, {en:"across",ko:"가로질러",tip:"a+cross(십자가): 가로질러"}, {en:"act",ko:"행동하다",tip:"act(행동하다): 액션!"},
      {en:"add",ko:"더하다",tip:"add(더하다): 추가하다"}, {en:"address",ko:"주소",tip:"ad+dress(보내다): 주소"}, {en:"adult",ko:"성인",tip:"ad(성장)+ult(완료): 성인"}, {en:"afraid",ko:"두려워하는",tip:"a+fraid(두려움): 두려운"}, {en:"after",ko:"~후에",tip:"af(뒤)+ter(비교): ~후에"},
      {en:"afternoon",ko:"오후",tip:"after(후)+noon(정오)=오후"}, {en:"again",ko:"다시",tip:"a+gain(반대): 다시 한번"}, {en:"against",ko:"~에 대항하여",tip:"again+st: 맞서서"}, {en:"age",ko:"나이",tip:"age: 시대나 나이"}, {en:"ago",ko:"~전에",tip:"a(멀리)+go(가다): ~전에"},
      {en:"agree",ko:"동의하다",tip:"a(에)+gree(기쁨): 동의"}, {en:"ahead",ko:"앞서서",tip:"a(에)+head(머리): 앞서"}, {en:"air",ko:"공기",tip:"air: 공기, 대기"}, {en:"airplane",ko:"비행기",tip:"air(공기)+plane(평면)"}, {en:"album",ko:"앨범",tip:"alb(흰색): 사진판"},
      {en:"all",ko:"모든",tip:"all: 전부, 모든"}, {en:"almost",ko:"거의",tip:"al(완전)+most(대부분)"}, {en:"alone",ko:"혼자",tip:"al(완전)+one(하나)=혼자"}, {en:"along",ko:"~을 따라",tip:"a(에)+long(긴): 길 따라"}, {en:"already",ko:"이미",tip:"al(완전)+ready(준비)=이미"},
      {en:"alright",ko:"괜찮은",tip:"all(전부)+right(옳은)"}, {en:"also",ko:"또한",tip:"al(완전)+so(그렇게)=또한"}, {en:"always",ko:"항상",tip:"all(모든)+ways(길)=항상"}, {en:"and",ko:"그리고",tip:"and: 그리고, ~와"}, {en:"animal",ko:"동물",tip:"anim(숨)+al: 살아있는 것"},
      {en:"another",ko:"또 다른",tip:"an(하나)+other(다른)"}, {en:"answer",ko:"대답하다",tip:"an(대항)+swer(말)=대답"}, {en:"any",ko:"어떤",tip:"any: 하나라도, 어떤"}, {en:"apartment",ko:"아파트",tip:"apart(따로)+ment=아파트"}, {en:"apple",ko:"사과",tip:"apple: 달콤한 사과"},
      {en:"area",ko:"지역",tip:"area: 넓은 땅, 지역"}, {en:"arm",ko:"팔",tip:"arm: 몸의 팔"}, {en:"around",ko:"주위에",tip:"a(에)+round(둥근): 주위"}, {en:"arrive",ko:"도착하다",tip:"ar(에)+rive(강가): 도착"}, {en:"art",ko:"예술",tip:"art: 예술, 기술"},
      {en:"as",ko:"~로서",tip:"as: ~처럼, ~로서"}, {en:"ask",ko:"묻다",tip:"ask: 묻다, 요청하다"}, {en:"at",ko:"~에서",tip:"at: 콕 짚은 지점"}, {en:"aunt",ko:"이모",tip:"aunt: 아주머니, 이모"}, {en:"autumn",ko:"가을",tip:"autumn: 낙엽 지는 가을"},
      {en:"away",ko:"떨어져서",tip:"a(멀리)+way(길): 떨어져"}, {en:"baby",ko:"아기",tip:"baby: 귀여운 아기"}, {en:"back",ko:"뒤로",tip:"back: 뒤쪽, 등"}, {en:"bad",ko:"나쁜",tip:"bad: 좋지 않은"}, {en:"badminton",ko:"배드민턴",tip:"badminton: 셔틀콕 경기"},
      {en:"bag",ko:"가방",tip:"bag: 물건 담는 백"}, {en:"bake",ko:"굽다",tip:"bake: 빵을 굽다"}, {en:"ball",ko:"공",tip:"ball: 둥근 공"}, {en:"banana",ko:"바나나",tip:"banana: 노란 과일"}, {en:"bank",ko:"은행",tip:"bank: 돈 모으는 둑"},
      {en:"base",ko:"기초",tip:"base: 바닥, 기초"}, {en:"baseball",ko:"야구",tip:"base(루)+ball(공)=야구"}, {en:"basket",ko:"바구니",tip:"basket: 바구니"}, {en:"basketball",ko:"농구",tip:"basket(바구니)+ball(공)"}, {en:"bat",ko:"방망이",tip:"bat: 야구 배트"},
      {en:"bath",ko:"목욕",tip:"bath: 욕조 목욕"}, {en:"be",ko:"~이다",tip:"be: 존재하다, ~이다"}, {en:"beach",ko:"해변",tip:"beach: 모래사장"}, {en:"bear",ko:"곰",tip:"bear: 커다란 곰"}, {en:"beauty",ko:"아름다움",tip:"beau(미)+ty: 아름다움"},
      {en:"because",ko:"~때문에",tip:"be+cause(원인): 때문에"}, {en:"become",ko:"~이 되다",tip:"be+come(오다): 변하다"}, {en:"bed",ko:"침대",tip:"bed: 잠자는 곳"}, {en:"bee",ko:"벌",tip:"bee: 붕붕 꿀벌"}, {en:"beef",ko:"소고기",tip:"beef: 맛있는 소고기"},
      {en:"before",ko:"~전에",tip:"be+fore(앞): ~전에"}, {en:"begin",ko:"시작하다",tip:"be+gin(열다): 시작"}, {en:"behind",ko:"뒤에",tip:"be+hind(뒤): 뒤편에"}, {en:"believe",ko:"믿다",tip:"be+lieve(사랑): 믿음"}, {en:"bell",ko:"종",tip:"bell: 댕댕 울리는 종"},
      {en:"below",ko:"아래에",tip:"be+low(낮은): 아래에"}, {en:"belt",ko:"벨트",tip:"belt: 허리띠"}, {en:"beside",ko:"~옆에",tip:"be+side(쪽): 옆쪽"}, {en:"between",ko:"~사이에",tip:"be+tween(둘): 둘 사이"}, {en:"big",ko:"큰",tip:"big: 커다란"},
      {en:"bike",ko:"자전거",tip:"bike: 두 바퀴 자전거"}, {en:"bill",ko:"계산서",tip:"bill: 영수증, 지폐"}, {en:"bird",ko:"새",tip:"bird: 하늘 나는 새"}, {en:"birth",ko:"탄생",tip:"bir(태어나다)+th: 탄생"}, {en:"biscuit",ko:"비스킷",tip:"bis(두번)+cuit(굽다)"},
      {en:"black",ko:"검은색",tip:"black: 깜깜한 검정"}, {en:"blood",ko:"피",tip:"blood: 빨간 혈액"}, {en:"blue",ko:"파란색",tip:"blue: 시원한 파랑"}, {en:"board",ko:"판자",tip:"board: 넓은 나무판"}, {en:"boat",ko:"보트",tip:"boat: 물 위의 배"},
      {en:"body",ko:"몸",tip:"body: 육체, 몸"}, {en:"bone",ko:"뼈",tip:"bone: 딱딱한 뼈"}, {en:"book",ko:"책",tip:"book: 읽는 책"}, {en:"borrow",ko:"빌리다",tip:"bor(보증)+row: 빌려오다"}, {en:"both",ko:"둘 다",tip:"bo(둘)+th: 양쪽 모두"},
      {en:"bottle",ko:"병",tip:"bottle: 물 담는 병"}, {en:"bottom",ko:"바닥",tip:"bot(바닥)+tom: 밑바닥"}, {en:"box",ko:"상자",tip:"box: 네모난 상자"}, {en:"boy",ko:"소년",tip:"boy: 남자 아이"}, {en:"brave",ko:"용감한",tip:"brave: 용기 있는"},
    ]
  },
  {
    id:2, title:"생활의 마을", emoji:"🏠",
    color:"#4ADE80", dark:"#15803d",
    desc:"초등 필수 단어 101~200번",
    words:[
      {en:"bread",ko:"빵",tip:"브레드(bread)는 맛있는 빵"}, {en:"break",ko:"부수다, 휴식",tip:"부수고(break) 잠깐 쉬기"}, {en:"breakfast",ko:"아침 식사",tip:"break(깨다)+fast(단식)=아침"}, {en:"bridge",ko:"다리",tip:"강 위를 잇는 브릿지(다리)"}, {en:"bright",ko:"밝은",tip:"빛(light)나서 밝은(bright)"},
      {en:"bring",ko:"가져오다",tip:"내 쪽으로 끌어(bring)오다"}, {en:"brother",ko:"형제",tip:"브라더(brother)는 내 형제"}, {en:"brown",ko:"갈색",tip:"밤색과 비슷한 브라운(갈색)"}, {en:"brush",ko:"붓, 솔질하다",tip:"브러시(brush)로 머리 빗기"}, {en:"build",ko:"짓다, 세우다",tip:"빌딩(building)을 짓다"},
      {en:"burn",ko:"타다, 태우다",tip:"불(burn)에 활활 타다"}, {en:"bus",ko:"버스",tip:"모두가 타는 버스(bus)"}, {en:"business",ko:"사업, 일",tip:"busy(바쁜)+ness(상태)=사업"}, {en:"busy",ko:"바쁜",tip:"비지(busy)하게 바쁜 일상"}, {en:"but",ko:"그러나",tip:"벗(but)! 반전이 있을 때"},
      {en:"butter",ko:"버터",tip:"빵에 발라 먹는 버터"}, {en:"button",ko:"단추, 버튼",tip:"꾹 누르는 단추(button)"}, {en:"buy",ko:"사다",tip:"바이(buy)하고 물건 사기"}, {en:"by",ko:"~옆에, ~에 의해",tip:"바이(by)바이 옆에서 인사"}, {en:"cake",ko:"케이크",tip:"축하할 때 먹는 케이크"},
      {en:"call",ko:"부르다, 전화하다",tip:"이름을 콜(call)하다"}, {en:"camera",ko:"카메라",tip:"사진 찍는 카메라"}, {en:"camp",ko:"야영지",tip:"텐트 치고 하는 캠핑(camp)"}, {en:"campaign",ko:"캠페인, 활동",tip:"camp(벌판)+aign(작전)=활동"}, {en:"can",ko:"할 수 있다, 깡통",tip:"할 수 있는 능력 캔(can)"},
      {en:"candy",ko:"사탕",tip:"달콤한 캔디(candy)"}, {en:"cap",ko:"모자",tip:"챙이 있는 캡(cap) 모자"}, {en:"car",ko:"자동차",tip:"부릉부릉 타는 카(car)"}, {en:"card",ko:"카드",tip:"네모난 종이 카드(card)"}, {en:"care",ko:"돌보다, 주의",tip:"케어(care)하고 돌보기"},
      {en:"carrot",ko:"당근",tip:"토끼가 먹는 캐럿(당근)"}, {en:"carry",ko:"운반하다",tip:"캐리어(carry)로 짐 옮기기"}, {en:"case",ko:"상자, 사례",tip:"케이스(case)에 담긴 물건"}, {en:"cash",ko:"현금",tip:"캐시(cash)로 현금 결제"}, {en:"cat",ko:"고양이",tip:"야옹야옹 캣(cat) 고양이"},
      {en:"catch",ko:"잡다",tip:"날아오는 공을 캐치(catch)"}, {en:"center",ko:"중심",tip:"한가운데 센터(center)"}, {en:"certain",ko:"확실한",tip:"써튼(certain)하게 확실한"}, {en:"chair",ko:"의자",tip:"앉아 쉬는 체어(chair)"}, {en:"chance",ko:"기회, 우연",tip:"행운의 찬스(chance) 기회"},
      {en:"change",ko:"바꾸다, 변화",tip:"체인지(change)해서 바꾸기"}, {en:"cheap",ko:"값싼",tip:"값이 싼(cheap) 치프한 것"}, {en:"cheese",ko:"치즈",tip:"노랗고 고소한 치즈"}, {en:"chicken",ko:"닭, 치킨",tip:"꼬꼬댁 닭 치킨(chicken)"}, {en:"child",ko:"아이",tip:"어린아이 차일드(child)"},
      {en:"chocolate",ko:"초콜릿",tip:"달콤한 초콜릿(chocolate)"}, {en:"choose",ko:"선택하다",tip:"원하는 것을 초즈(choose)함"}, {en:"church",ko:"교회",tip:"예배드리는 처치(church)"}, {en:"circle",ko:"원, 집단",tip:"동그란 서클(circle) 원"}, {en:"city",ko:"도시",tip:"빌딩 많은 시티(city) 도시"},
      {en:"class",ko:"수업, 학급",tip:"교실 클래스(class) 수업"}, {en:"clean",ko:"깨끗한",tip:"청소해서 클린(clean)한"}, {en:"clear",ko:"맑은, 명확한",tip:"클리어(clear)하게 투명한"}, {en:"clever",ko:"영리한",tip:"클레버(clever)한 똑똑이"}, {en:"climb",ko:"오르다",tip:"산을 기어(climb) 오르다"},
      {en:"clock",ko:"시계",tip:"똑딱똑딱 클락(clock) 시계"}, {en:"close",ko:"닫다, 가까운",tip:"문을 클로즈(close) 닫다"}, {en:"clothes",ko:"옷",tip:"클로즈(clothes)는 입는 옷"}, {en:"cloud",ko:"구름",tip:"하늘 위 클라우드(cloud)"}, {en:"club",ko:"클럽, 동아리",tip:"모이는 클럽(club) 동아리"},
      {en:"coat",ko:"코트, 외투",tip:"추울 때 입는 코트(coat)"}, {en:"coffee",ko:"커피",tip:"향긋한 커피(coffee)"}, {en:"cold",ko:"추운, 감기",tip:"콜드(cold)해서 걸린 감기"}, {en:"collect",ko:"모으다",tip:"col(함께)+lect(모으다)=수집"}, {en:"college",ko:"대학",tip:"col(함께)+lege(선택)=대학"},
      {en:"come",ko:"오다",tip:"이리로 컴(come) 오다"}, {en:"comic",ko:"만화의, 웃기는",tip:"코믹(comic)하고 재밌는"}, {en:"company",ko:"회사, 동료",tip:"com(함께)+pany(빵)=동료"}, {en:"compute",ko:"계산하다",tip:"com(함께)+pute(생각)=계산"}, {en:"condition",ko:"상태, 조건",tip:"몸 컨디션(condition) 상태"},
      {en:"congratulate",ko:"축하하다",tip:"con(함께)+gratu(기쁨)=축하"}, {en:"control",ko:"조절하다",tip:"컨트롤(control)하여 조절"}, {en:"cook",ko:"요리하다",tip:"음식 만드는 쿡(cook)"}, {en:"cool",ko:"시원한, 멋진",tip:"시원하고 쿨(cool)한 느낌"}, {en:"corner",ko:"모퉁이",tip:"길모퉁이 코너(corner)"},
      {en:"cost",ko:"비용",tip:"물건의 코스트(cost) 비용"}, {en:"could",ko:"할 수 있었다",tip:"can의 과거형 쿠드(could)"}, {en:"country",ko:"나라, 시골",tip:"우리가 사는 컨트리(나라)"}, {en:"couple",ko:"커플, 두 개",tip:"둘이 한 쌍인 커플(couple)"}, {en:"course",ko:"과정, 항로",tip:"배움의 코스(course) 과정"},
      {en:"court",ko:"법정, 경기장",tip:"재판받는 코트(court) 법정"}, {en:"cousin",ko:"사촌",tip:"이모네 아들 커즌(사촌)"}, {en:"cover",ko:"덮다, 표지",tip:"책 겉면 커버(cover) 덮개"}, {en:"cow",ko:"암소",tip:"음메~ 소 카우(cow)"}, {en:"crayon",ko:"크레용",tip:"그림 그리는 크레용(crayon)"},
      {en:"cream",ko:"크림",tip:"부드러운 생크림(cream)"}, {en:"cross",ko:"건너다, 십자가",tip:"길을 가로질러 크로스(cross)"}, {en:"cry",ko:"울다",tip:"눈물 흘리며 크라이(cry)"}, {en:"culture",ko:"문화",tip:"cult(경작)+ure(명사)=문화"}, {en:"cup",ko:"컵",tip:"물 마시는 컵(cup)"},
      {en:"curtain",ko:"커튼",tip:"창문 가리는 커튼(curtain)"}, {en:"customer",ko:"고객",tip:"custom(습관)+er(사람)=고객"}, {en:"cut",ko:"자르다",tip:"가위로 컷(cut) 자르기"}, {en:"dance",ko:"춤추다",tip:"음악 맞춰 댄스(dance)"}, {en:"danger",ko:"위험",tip:"단거(danger) 많이 먹음 위험"},
      {en:"dark",ko:"어두운",tip:"빛이 없는 다크(dark)한 밤"}, {en:"date",ko:"날짜, 데이트",tip:"오늘 날짜 데이트(date)"}, {en:"daughter",ko:"딸",tip:"daught(낳다)+er(사람)=딸"}, {en:"day",ko:"날, 하루",tip:"해가 떠 있는 밝은 시간"}, {en:"dead",ko:"죽은",tip:"de(죽음)+ad(상태)=죽은"},
    ]
  },
  {
    id:3, title:"학교의 교실", emoji:"🏫",
    color:"#4ADE80", dark:"#15803d",
    desc:"초등 필수 단어 201~300번",
    words:[
      {en:"death",ko:"죽음",tip:"die(죽다)의 명사형"}, {en:"decide",ko:"결정하다",tip:"de(완전히)+cide(자르다)=결정"}, {en:"deep",ko:"깊은",tip:"아래로 깊게 쑥 들어간"}, {en:"delicious",ko:"맛있는",tip:"de(강조)+lic(유혹)=맛있는"}, {en:"design",ko:"설계하다",tip:"de(아래)+sign(표시)=설계"},
      {en:"desk",ko:"책상",tip:"공부할 때 쓰는 탁자"}, {en:"dialogue",ko:"대화",tip:"dia(사이)+logue(말)=대화"}, {en:"die",ko:"죽다",tip:"생명이 다이(die)하다"}, {en:"difficult",ko:"어려운",tip:"dif(부정)+ficul(쉬운)=어려운"}, {en:"dinner",ko:"저녁 식사",tip:"하루를 마치는 저녁밥"},
      {en:"discuss",ko:"논의하다",tip:"dis(따로)+cuss(치다)=토론"}, {en:"do",ko:"하다",tip:"어떤 행동을 행함"}, {en:"doctor",ko:"의사",tip:"doc(가르치다)+tor(사람)=의사"}, {en:"dog",ko:"개",tip:"멍멍 짖는 강아지"}, {en:"doll",ko:"인형",tip:"사람 모양 장난감"},
      {en:"door",ko:"문",tip:"드나드는 문"}, {en:"double",ko:"두 배의",tip:"dou(둘)+ble(겹침)=두 배"}, {en:"doughnut",ko:"도넛",tip:"dough(반죽)+nut(견과)=도넛"}, {en:"down",ko:"아래로",tip:"위에서 밑으로 방향"}, {en:"draw",ko:"그리다",tip:"펜으로 선을 끌어 당기다"},
      {en:"dream",ko:"꿈",tip:"잠잘 때 꾸는 소망"}, {en:"dress",ko:"드레스, 옷",tip:"몸을 바르게 입히는 옷"}, {en:"drink",ko:"마시다",tip:"액체를 꿀꺽 마심"}, {en:"drive",ko:"운전하다",tip:"차를 앞으로 몰고 가다"}, {en:"drop",ko:"떨어뜨리다",tip:"툭 하고 아래로 떨어짐"},
      {en:"drum",ko:"드럼",tip:"둥둥 두드리는 악기"}, {en:"dry",ko:"마른",tip:"물기가 싹 마른 상태"}, {en:"duck",ko:"오리",tip:"꽥꽥거리는 오리"}, {en:"during",ko:"~동안",tip:"dur(지속)+ing=~동안"}, {en:"ear",ko:"귀",tip:"소리를 듣는 신체 부위"},
      {en:"early",ko:"일찍",tip:"정해진 시간보다 먼저"}, {en:"earth",ko:"지구",tip:"우리가 사는 푸른 땅"}, {en:"east",ko:"동쪽",tip:"해가 뜨는 방향"}, {en:"eat",ko:"먹다",tip:"음식을 섭취하다"}, {en:"egg",ko:"달걀",tip:"둥근 계란"},
      {en:"eight",ko:"8",tip:"숫자 여덟"}, {en:"elephant",ko:"코끼리",tip:"몸집이 크고 코가 긴 동물"}, {en:"eleven",ko:"11",tip:"열한 개"}, {en:"end",ko:"끝",tip:"마지막 종료 지점"}, {en:"energy",ko:"에너지",tip:"en(안)+erg(일)=활동력"},
      {en:"enough",ko:"충분한",tip:"더 필요 없을 만큼 넉넉함"}, {en:"enter",ko:"들어가다",tip:"ent(안으로)+er=입장"}, {en:"evening",ko:"저녁",tip:"해가 진 뒤 밤 전 시간"}, {en:"every",ko:"모든",tip:"하나도 빠짐없이 전부"}, {en:"example",ko:"예시",tip:"ex(밖)+ample(취하다)=사례"},
      {en:"exercise",ko:"운동하다",tip:"ex(밖)+erc(일하다)=운동"}, {en:"eye",ko:"눈",tip:"보는 눈 모양 e-y-e"}, {en:"face",ko:"얼굴",tip:"사람의 앞면 얼굴"}, {en:"fact",ko:"사실",tip:"fac(만들다)->행해진 사실"}, {en:"fail",ko:"실패하다",tip:"성공하지 못함"},
      {en:"fall",ko:"떨어지다, 가을",tip:"낙엽이 떨어지는 가을"}, {en:"family",ko:"가족",tip:"fam(가족)+ily=가족"}, {en:"fan",ko:"팬, 부채",tip:"바람을 일으키는 도구"}, {en:"far",ko:"먼",tip:"거리가 아주 먼"}, {en:"farm",ko:"농장",tip:"작물을 기르는 농원"},
      {en:"fast",ko:"빠른",tip:"속도가 매우 빠른"}, {en:"fat",ko:"뚱뚱한",tip:"지방이 많은 상태"}, {en:"father",ko:"아버지",tip:"나를 낳아주신 아빠"}, {en:"favorite",ko:"좋아하는",tip:"favor(호의)+ite=최애의"}, {en:"feel",ko:"느끼다",tip:"몸이나 마음으로 감각함"},
      {en:"festival",ko:"축제",tip:"fest(잔치)+ival=축제"}, {en:"field",ko:"들판, 분야",tip:"탁 트인 벌판"}, {en:"fight",ko:"싸우다",tip:"치고받고 다투다"}, {en:"file",ko:"파일",tip:"서류를 묶어 둔 것"}, {en:"fill",ko:"채우다",tip:"빈 곳을 가득 채움"},
      {en:"film",ko:"영화",tip:"필름에 담긴 영상"}, {en:"find",ko:"찾다",tip:"잃은 것을 발견하다"}, {en:"fine",ko:"좋은, 벌금",tip:"날씨가 맑고 좋음"}, {en:"finger",ko:"손가락",tip:"손끝에 달린 가락"}, {en:"finish",ko:"끝내다",tip:"fin(끝)+ish=완성"},
      {en:"fire",ko:"불",tip:"타오르는 불길"}, {en:"first",ko:"첫 번째의",tip:"가장 먼저인"}, {en:"fish",ko:"물고기",tip:"물에 사는 어류"}, {en:"five",ko:"5",tip:"숫자 다섯"}, {en:"fix",ko:"고치다, 고정하다",tip:"단단히 고정해서 고침"},
      {en:"floor",ko:"바닥, 층",tip:"밟고 다니는 마루"}, {en:"flower",ko:"꽃",tip:"예쁘게 피어나는 꽃"}, {en:"fly",ko:"날다, 파리",tip:"하늘을 날아다님"}, {en:"focus",ko:"집중하다",tip:"한 초점에 집중함"}, {en:"food",ko:"음식",tip:"먹고 사는 양식"},
      {en:"fool",ko:"바보",tip:"어리석은 사람"}, {en:"foot",ko:"발",tip:"걸음을 걷는 발"}, {en:"football",ko:"축구",tip:"foot(발)+ball(공)=축구"}, {en:"for",ko:"~을 위해",tip:"누군가를 향한 목적"}, {en:"forest",ko:"숲",tip:"for(밖)+est=바깥의 숲"},
      {en:"forget",ko:"잊다",tip:"for(멀리)+get(얻다)=잊다"}, {en:"fork",ko:"포크",tip:"음식을 콕 찍는 포크"}, {en:"four",ko:"4",tip:"숫자 넷"}, {en:"fox",ko:"여우",tip:"영리한 동물 여우"}, {en:"free",ko:"자유로운",tip:"구속 없는 공짜의"},
      {en:"fresh",ko:"신선한",tip:"갓 잡은 듯 싱싱한"}, {en:"friend",ko:"친구",tip:"가까이 지내는 동료"}, {en:"from",ko:"~로부터",tip:"출발점과 기점"}, {en:"front",ko:"앞",tip:"맨 앞부분"}, {en:"fruit",ko:"과일",tip:"나무에서 맺힌 열매"},
      {en:"full",ko:"가득 찬",tip:"가득 차서 배부른"}, {en:"fun",ko:"재미",tip:"즐거운 재미"}, {en:"future",ko:"미래",tip:"fu(앞으로)+ture(상태)=미래"}, {en:"game",ko:"게임",tip:"놀이와 경기"}, {en:"garden",ko:"정원",tip:"꽃을 가꾸는 정원"},
    ]
  },
  {
    id:4, title:"감정의 숲", emoji:"💚",
    color:"#4ADE80", dark:"#15803d",
    desc:"초등 필수 단어 301~400번",
    words:[
      {en:"gas",ko:"기체",tip:"가스나 공기 상태"}, {en:"gentleman",ko:"신사",tip:"gentle(점잖은)+man(남자)"}, {en:"get",ko:"얻다",tip:"get해서 갖다"}, {en:"girl",ko:"소녀",tip:"여자 아이"}, {en:"give",ko:"주다",tip:"기부(give)하며 주다"},
      {en:"glad",ko:"기쁜",tip:"그래도(glad) 기쁘다"}, {en:"glass",ko:"유리",tip:"유리잔이나 안경"}, {en:"go",ko:"가다",tip:"go(고)! 가다"}, {en:"goal",ko:"목표",tip:"골인(goal) 지점"}, {en:"god",ko:"신",tip:"하느님과 신"},
      {en:"gold",ko:"금",tip:"황금빛 골드"}, {en:"good",ko:"좋은",tip:"굿(good)이에요"}, {en:"goodbye",ko:"안녕",tip:"good(좋은)+bye(작별)"}, {en:"grandfather",ko:"할아버지",tip:"grand(큰)+father(아빠)"}, {en:"grape",ko:"포도",tip:"그레이프 주스"},
      {en:"grass",ko:"풀",tip:"초록색 풀밭"}, {en:"gray",ko:"회색",tip:"구름 낀 회색"}, {en:"great",ko:"위대한",tip:"대단하고 훌륭한"}, {en:"green",ko:"초록색",tip:"싱그러운 초록색"}, {en:"ground",ko:"땅",tip:"운동장 그라운드"},
      {en:"group",ko:"그룹",tip:"집단과 모임"}, {en:"grow",ko:"자라다",tip:"쑥쑥 자라다"}, {en:"guess",ko:"추측하다",tip:"게스: 때려맞히기"}, {en:"guitar",ko:"기타",tip:"줄을 튕기는 악기"}, {en:"gum",ko:"껌",tip:"단물 나오는 껌"},
      {en:"guy",ko:"남자",tip:"멋진 남자 녀석"}, {en:"habit",ko:"습관",tip:"몸에 해(ha)버릇(bit)인 것"}, {en:"hair",ko:"머리카락",tip:"헤어 스타일"}, {en:"hamburger",ko:"햄버거",tip:"맛있는 햄버거"}, {en:"hand",ko:"손",tip:"핸드 크림 바르는 손"},
      {en:"hang",ko:"걸다",tip:"벽에 행(hang)하고 걸다"}, {en:"happy",ko:"행복한",tip:"해피엔딩"}, {en:"hard",ko:"어려운",tip:"딱딱하고 어려운"}, {en:"hat",ko:"모자",tip:"햇빛 가리는 모자"}, {en:"hate",ko:"싫어하다",tip:"미워하고 싫어함"},
      {en:"have",ko:"가지다",tip:"해브(have)하다"}, {en:"he",ko:"그",tip:"남자 그(He)"}, {en:"head",ko:"머리",tip:"헤드라이트 머리"}, {en:"heart",ko:"심장",tip:"하트 무늬 심장"}, {en:"heat",ko:"열",tip:"히터의 열기"},
      {en:"heavy",ko:"무거운",tip:"헤비급 선수"}, {en:"hello",ko:"안녕",tip:"인사할 때 소리"}, {en:"helmet",ko:"헬멧",tip:"머리 보호 헬멧"}, {en:"help",ko:"돕다",tip:"도와주는 헬퍼"}, {en:"here",ko:"여기",tip:"히어: 여기에"},
      {en:"hero",ko:"영웅",tip:"히어로물 주인공"}, {en:"high",ko:"높은",tip:"높이 하이(high)"}, {en:"hike",ko:"등산하다",tip:"걸으며 여행하다"}, {en:"hill",ko:"언덕",tip:"낮은 산 언덕"}, {en:"history",ko:"역사",tip:"his(그의)+story(이야기)"},
      {en:"hit",ko:"치다",tip:"히트곡/안타를 치다"}, {en:"hobby",ko:"취미",tip:"내가 즐기는 취미"}, {en:"hold",ko:"잡다",tip:"손으로 잡고 있다"}, {en:"holiday",ko:"공휴일",tip:"holi(성스런)+day(날)"}, {en:"home",ko:"집",tip:"편안한 집/가정"},
      {en:"homework",ko:"숙제",tip:"home(집)+work(일)"}, {en:"honest",ko:"정직한",tip:"어니스트: 정직한"}, {en:"hope",ko:"바라다",tip:"희망을 품다"}, {en:"horse",ko:"말",tip:"달리는 말"}, {en:"hospital",ko:"병원",tip:"아플 때 가는 곳"},
      {en:"hot",ko:"뜨거운",tip:"뜨끈한 핫팩"}, {en:"hour",ko:"시간",tip:"한 시간(hour)"}, {en:"house",ko:"집",tip:"건물로서의 집"}, {en:"how",ko:"어떻게",tip:"방법을 묻는 말"}, {en:"however",ko:"그러나",tip:"how(어떻게)+ever(든지)"},
      {en:"human",ko:"인간",tip:"사람/인간"}, {en:"hundred",ko:"백",tip:"숫자 100"}, {en:"hunt",ko:"사냥하다",tip:"사냥하는 헌터"}, {en:"hurry",ko:"서두르다",tip:"허리(hurry)업!"}, {en:"husband",ko:"남편",tip:"결혼한 남자"},
      {en:"I",ko:"나",tip:"나 1인칭"}, {en:"ice",ko:"얼음",tip:"차가운 아이스"}, {en:"idea",ko:"생각",tip:"새로운 아이디어"}, {en:"if",ko:"만약",tip:"조건을 거는 만약"}, {en:"image",ko:"이미지",tip:"형태나 모습"},
      {en:"in",ko:"안에",tip:"안(in)에 있다"}, {en:"inside",ko:"안쪽",tip:"in(안)+side(쪽)"}, {en:"internet",ko:"인터넷",tip:"inter(사이)+net(망)"}, {en:"into",ko:"안으로",tip:"in(안)+to(쪽으로)"}, {en:"introduce",ko:"소개하다",tip:"intro(안으로)+duce(이끌다)"},
      {en:"invite",ko:"초대하다",tip:"in(안)+vite(부르다)"}, {en:"issue",ko:"문제",tip:"is(밖으로)+sue(나온 것)"}, {en:"it",ko:"그것",tip:"지칭하는 그것"}, {en:"jacket",ko:"재킷",tip:"짧은 상의"}, {en:"jam",ko:"잼",tip:"과일 조림 잼"},
      {en:"job",ko:"직업",tip:"내 일과 직업"}, {en:"join",ko:"참여하다",tip:"함께 조인하다"}, {en:"juice",ko:"주스",tip:"과일 주스"}, {en:"jump",ko:"뛰다",tip:"점프하여 뛰다"}, {en:"just",ko:"단지",tip:"그저/단지"},
      {en:"keep",ko:"유지하다",tip:"계속 킵(keep)하다"}, {en:"key",ko:"열쇠",tip:"핵심 열쇠"}, {en:"kick",ko:"차다",tip:"발로 차는 킥"}, {en:"kid",ko:"아이",tip:"어린 꼬마"}, {en:"kill",ko:"죽이다",tip:"킬러가 죽이다"},
      {en:"kind",ko:"친절한",tip:"착하고 친절한"}, {en:"king",ko:"왕",tip:"k(코)+ing(진행)->코가 높은 왕"}, {en:"kiss",ko:"키스(입맞춤)",tip:"k(입)+iss(붙다)->입맞춤"}, {en:"kitchen",ko:"부엌",tip:"kit(도구)+chen(장소)=부엌"}, {en:"knife",ko:"칼",tip:"k(무음)+nife(나이프)=칼"},
    ]
  },
  {
    id:5, title:"시간의 강", emoji:"⏰",
    color:"#4ADE80", dark:"#15803d",
    desc:"초등 필수 단어 401~500번",
    words:[
      {en:"know",ko:"알다",tip:"kn(알다)+ow(상태)=알다"}, {en:"lady",ko:"숙녀",tip:"l(귀부인)+ady(여성)=숙녀"}, {en:"lake",ko:"호수",tip:"l(길게)+ake(물)=호수"}, {en:"land",ko:"땅, 육지",tip:"l(넓은)+and(땅)=육지"}, {en:"large",ko:"큰",tip:"lar(넓은)+ge(상태)=큰"},
      {en:"laser",ko:"레이저",tip:"light(빛)+aser(증폭)=레이저"}, {en:"last",ko:"마지막의",tip:"l(끝)+ast(가장)=마지막의"}, {en:"late",ko:"늦은",tip:"l(늦게)+ate(상태)=늦은"}, {en:"lazy",ko:"게으른",tip:"l(처진)+azy(상태)=게으른"}, {en:"learn",ko:"배우다",tip:"l(공부)+earn(얻다)=배우다"},
      {en:"left",ko:"왼쪽",tip:"l(왼쪽)+eft(방향)=왼쪽"}, {en:"leg",ko:"다리",tip:"l(긴)+eg(다리)=다리"}, {en:"lesson",ko:"수업, 교훈",tip:"less(적은)+on(위)=수업"}, {en:"letter",ko:"편지, 글자",tip:"let(남기다)+ter(것)=편지"}, {en:"library",ko:"도서관",tip:"libr(책)+ary(장소)=도서관"},
      {en:"lie",ko:"거짓말하다, 눕다",tip:"l(누운)+ie(상태)=눕다"}, {en:"life",ko:"생명, 삶",tip:"li(살다)+fe(것)=생명"}, {en:"light",ko:"빛, 가벼운",tip:"li(빛)+ght(밝은)=빛"}, {en:"like",ko:"좋아하다",tip:"li(마음)+ke(끌리다)=좋아하다"}, {en:"line",ko:"선",tip:"li(길쭉한)+ne(것)=선"},
      {en:"lion",ko:"사자",tip:"l(갈기)+ion(동물)=사자"}, {en:"lip",ko:"입술",tip:"l(입)+ip(가장자리)=입술"}, {en:"listen",ko:"듣다",tip:"list(귀기울이다)+en(하다)=듣다"}, {en:"little",ko:"작은",tip:"lit(작은)+tle(것)=작은"}, {en:"live",ko:"살다",tip:"li(생명)+ve(상태)=살다"},
      {en:"long",ko:"긴",tip:"lo(길게)+ng(상태)=긴"}, {en:"look",ko:"보다",tip:"loo(두눈)+k(방향)=보다"}, {en:"love",ko:"사랑",tip:"l(심장)+ove(상태)=사랑"}, {en:"low",ko:"낮은",tip:"l(아래)+ow(상태)=낮은"}, {en:"luck",ko:"운",tip:"lu(빛)+ck(행운)=운"},
      {en:"lunch",ko:"점심",tip:"l(낮)+unch(먹다)=점심"}, {en:"mad",ko:"미친, 화난",tip:"m(화)+ad(상태)=화난"}, {en:"mail",ko:"우편",tip:"m(전하다)+ail(것)=우편"}, {en:"make",ko:"만들다",tip:"m(손)+ake(행위)=만들다"}, {en:"man",ko:"남자",tip:"m(사람)+an(성인)=남자"},
      {en:"many",ko:"많은",tip:"m(가득)+any(것)=많은"}, {en:"map",ko:"지도",tip:"m(종이)+ap(그림)=지도"}, {en:"marathon",ko:"마라톤",tip:"mara(전장)+thon(달리기)=마라톤"}, {en:"market",ko:"시장",tip:"mark(상품)+et(장소)=시장"}, {en:"marry",ko:"결혼하다",tip:"mar(짝)+ry(하다)=결혼하다"},
      {en:"mathematics",ko:"수학",tip:"math(배우다)+s(학문)=수학"}, {en:"may",ko:"~일지도 모른다",tip:"m(가능)+ay(추측)=~일지도"}, {en:"meat",ko:"고기",tip:"me(먹는)+at(것)=고기"}, {en:"medal",ko:"메달",tip:"med(보상)+al(것)=메달"}, {en:"meet",ko:"만나다",tip:"mee(함께)+t(모이다)=만나다"},
      {en:"member",ko:"구성원",tip:"mem(부분)+ber(사람)=구성원"}, {en:"memory",ko:"기억",tip:"mem(기억)+ory(것)=기억"}, {en:"middle",ko:"중간의",tip:"mid(중간)+dle(상태)=중간의"}, {en:"might",ko:"~일지도 모른다",tip:"mi(가능)+ght(약한)=~일지도"}, {en:"milk",ko:"우유",tip:"m(젖)+ilk(것)=우유"},
      {en:"mind",ko:"마음",tip:"min(생각)+d(상태)=마음"}, {en:"miss",ko:"놓치다, 그리워하다",tip:"mis(잃다)=놓치다, 그리워하다"}, {en:"model",ko:"모델, 모형",tip:"mod(모양)+el(작은)=모형"}, {en:"money",ko:"돈",tip:"mon(화폐)+ey(것)=돈"}, {en:"monkey",ko:"원숭이",tip:"mon(흉내)+key(동물)=원숭이"},
      {en:"month",ko:"달(월)",tip:"mon(달)+th(기간)=달(월)"}, {en:"moon",ko:"달(위성)",tip:"moo(밝은)+n(밤하늘)=달"}, {en:"morning",ko:"아침",tip:"morn(아침)+ing(시간)=아침"}, {en:"mother",ko:"어머니",tip:"mo(엄마)+ther(부모)=어머니"}, {en:"mountain",ko:"산",tip:"mount(오르다)+ain(곳)=산"},
      {en:"mouse",ko:"쥐",tip:"mou(작은)+se(동물)=쥐"}, {en:"mouth",ko:"입",tip:"mou(먹는)+th(곳)=입"}, {en:"move",ko:"움직이다",tip:"mo(움직)+ve(하다)=움직이다"}, {en:"movie",ko:"영화",tip:"mov(움직임)+ie(것)=영화"}, {en:"much",ko:"많은",tip:"mu(양)+ch(가득)=많은"},
      {en:"music",ko:"음악",tip:"mus(뮤즈)+ic(예술)=음악"}, {en:"must",ko:"~해야 한다",tip:"mus(의무)+t(강한)=~해야한다"}, {en:"name",ko:"이름",tip:"na(부르다)+me(것)=이름"}, {en:"nation",ko:"국가",tip:"nat(태어나다)+ion(곳)=국가"}, {en:"nature",ko:"자연",tip:"nat(태생)+ure(상태)=자연"},
      {en:"near",ko:"가까운",tip:"ne(가까이)+ar(상태)=가까운"}, {en:"neck",ko:"목",tip:"ne(연결)+ck(부위)=목"}, {en:"need",ko:"필요하다",tip:"nee(필수)+d(상태)=필요하다"}, {en:"never",ko:"결코 ~않다",tip:"ne(부정)+ver(항상)=결코 않다"}, {en:"new",ko:"새로운",tip:"ne(새로운)+w(상태)=새로운"},
      {en:"news",ko:"뉴스",tip:"N(북)E(동)W(서)S(남)=뉴스"}, {en:"newspaper",ko:"신문",tip:"news(뉴스)+paper(종이)=신문"}, {en:"next",ko:"다음의",tip:"nex(이음)+t(것)=다음의"}, {en:"nice",ko:"좋은",tip:"ni(친절)+ce(상태)=좋은"}, {en:"night",ko:"밤",tip:"ni(어두운)+ght(밤)=밤"},
      {en:"nine",ko:"아홉",tip:"ni(숫자)+ne(9)=아홉"}, {en:"no",ko:"아니오",tip:"n(부정)+o(말)=아니오"}, {en:"north",ko:"북쪽",tip:"nor(북)+th(방향)=북쪽"}, {en:"nose",ko:"코",tip:"no(냄새)+se(부위)=코"}, {en:"not",ko:"~아니다",tip:"n(부정)+ot(상태)=~아니다"},
      {en:"note",ko:"메모",tip:"no(적다)+te(것)=메모"}, {en:"notebook",ko:"공책",tip:"note(메모)+book(책)=공책"}, {en:"nothing",ko:"아무것도 없음",tip:"no(없음)+thing(것)=아무것도"}, {en:"now",ko:"지금",tip:"no(이)+w(시간)=지금"}, {en:"number",ko:"숫자",tip:"num(세기)+ber(것)=숫자"},
      {en:"nurse",ko:"간호사",tip:"nur(돌보다)+se(사람)=간호사"}, {en:"of",ko:"~의",tip:"o(부분)+f(전체)=~의"}, {en:"off",ko:"떨어져",tip:"o(분리)+ff(상태)=떨어져"}, {en:"office",ko:"사무실",tip:"offi(업무)+ce(장소)=사무실"}, {en:"often",ko:"자주",tip:"oft(종종)+en(상태)=자주"},
      {en:"oil",ko:"기름",tip:"oi(액체)+l(미끄러운)=기름"}, {en:"okay",ko:"괜찮은, 좋아",tip:"O(all)+K(korrect)의 약자"}, {en:"old",ko:"늙은, 오래된",tip:"old(오래된) 낡은 옷"}, {en:"on",ko:"~위에, 켜진",tip:"표면에 on(붙어서) 위에"}, {en:"one",ko:"하나, 1",tip:"하나(one)뿐인 내 인생"},
    ]
  },
  {
    id:6, title:"몸과 건강", emoji:"💪",
    color:"#4ADE80", dark:"#15803d",
    desc:"초등 필수 단어 501~600번",
    words:[
      {en:"only",ko:"오직, 단지",tip:"one(하나)+ly(하게)=오직"}, {en:"open",ko:"열다, 열린",tip:"문을 open(열다)"}, {en:"or",ko:"또는, 혹은",tip:"A or(또는) B 고르기"}, {en:"orange",ko:"오렌지, 주황색",tip:"오렌지색 orange"}, {en:"out",ko:"밖으로, 나간",tip:"in의 반대 out(밖)"},
      {en:"over",ko:"~너머에, 끝난",tip:"선 over(너머)로 넘어가다"}, {en:"page",ko:"페이지, 쪽",tip:"책의 다음 page(쪽)"}, {en:"paint",ko:"페인트, 칠하다",tip:"paint(물감)로 그려"}, {en:"pants",ko:"바지",tip:"두 다리라 pants(복수)"}, {en:"paper",ko:"종이",tip:"papyrus(파피루스)->종이"},
      {en:"parent",ko:"부모",tip:"par(동등)+ent(사람)->부모"}, {en:"park",ko:"공원, 주차하다",tip:"park(공원)에 주차해"}, {en:"part",ko:"부분, 일부",tip:"part(나누다)->부분"}, {en:"partner",ko:"동료, 파트너",tip:"part(부분)+ner(사람)=짝"}, {en:"party",ko:"파티, 정당",tip:"part(나누다)->무리/파티"},
      {en:"pass",ko:"통과하다, 건네주다",tip:"시험을 pass(통과)하다"}, {en:"pay",ko:"지불하다, 보수",tip:"돈을 pay(지불)하다"}, {en:"pen",ko:"펜, 볼펜",tip:"pen(깃털)->펜"}, {en:"pencil",ko:"연필",tip:"pen(펜)+cil(작은)=연필"}, {en:"people",ko:"사람들",tip:"peo(민중)+ple(가득한)"},
      {en:"piano",ko:"피아노",tip:"piano(부드럽게) 치는 악기"}, {en:"pick",ko:"고르다, 집다",tip:"손으로 pick(고르다)"}, {en:"picture",ko:"사진, 그림",tip:"pict(그리다)+ure(것)=그림"}, {en:"pig",ko:"돼지",tip:"꿀꿀 pig(돼지)"}, {en:"pilot",ko:"조종사",tip:"비행기 pilot(조종사)"},
      {en:"pink",ko:"분홍색",tip:"예쁜 분홍 pink"}, {en:"pizza",ko:"피자",tip:"맛있는 pizza(피자)"}, {en:"place",ko:"장소, 놓다",tip:"평평한 plate(판)->장소"}, {en:"plan",ko:"계획",tip:"plan(평면도)->설계/계획"}, {en:"plastic",ko:"플라스틱",tip:"plas(만들다)+tic=만들기 쉬운"},
      {en:"play",ko:"놀다, 연주하다",tip:"친구랑 play(놀다)"}, {en:"please",ko:"제발, 기쁘게 하다",tip:"상대를 기쁘게(pleas) 해"}, {en:"point",ko:"점, 지점, 가리키다",tip:"point(뾰족한 끝)"}, {en:"police",ko:"경찰",tip:"poli(도시)+ce(지킴이)"}, {en:"poor",ko:"가난한, 불쌍한",tip:"pau(적은)->돈이 적은"},
      {en:"potato",ko:"감자",tip:"땅속 덩이 potato"}, {en:"power",ko:"힘, 권력",tip:"강한 power(힘)"}, {en:"present",ko:"현재의, 선물, 주다",tip:"pre(앞)+sent(존재)->선물"}, {en:"pretty",ko:"예쁜, 꽤",tip:"귀엽고 pretty(예쁜)"}, {en:"prince",ko:"왕자",tip:"prin(첫째)+ce(사람)->왕자"},
      {en:"print",ko:"인쇄하다",tip:"도장을 print(찍다)"}, {en:"problem",ko:"문제",tip:"pro(앞)+blem(던지다)->문제"}, {en:"program",ko:"프로그램, 계획",tip:"pro(앞)+gram(쓰다)->계획"}, {en:"project",ko:"프로젝트, 계획",tip:"pro(앞)+ject(던지다)->계획"}, {en:"puppy",ko:"강아지",tip:"귀여운 puppy(강아지)"},
      {en:"push",ko:"밀다",tip:"문은 push(밀다)"}, {en:"put",ko:"놓다, 두다",tip:"풋(put)하고 내려놔"}, {en:"queen",ko:"여왕",tip:"여왕님 queen"}, {en:"question",ko:"질문, 의문",tip:"quest(찾다)+ion=질문"}, {en:"quick",ko:"빠른",tip:"퀵(quick) 서비스"},
      {en:"quiet",ko:"조용한",tip:"qui(휴식)->조용히 해"}, {en:"quiz",ko:"퀴즈, 시험",tip:"재미있는 quiz(시험)"}, {en:"rabbit",ko:"토끼",tip:"귀가 긴 rabbit"}, {en:"race",ko:"경주, 인종",tip:"달리기 race(경주)"}, {en:"radio",ko:"라디오",tip:"전파(radi)를 듣는 radio"},
      {en:"rain",ko:"비, 비가 오다",tip:"rain(비) 내리는 날"}, {en:"read",ko:"읽다",tip:"책을 read(읽다)"}, {en:"ready",ko:"준비된",tip:"I\'m ready(준비됐어)"}, {en:"recreation",ko:"휴양, 레크리에이션",tip:"re(다시)+create(만들다)"}, {en:"red",ko:"빨간색",tip:"빨간 사과 red"},
      {en:"remember",ko:"기억하다",tip:"re(다시)+member(마음)"}, {en:"restaurant",ko:"식당",tip:"restau(회복)+rant(곳)"}, {en:"restroom",ko:"화장실",tip:"rest(휴식)+room(방)"}, {en:"return",ko:"돌아오다, 반환",tip:"re(다시)+turn(돌다)"}, {en:"ribbon",ko:"리본",tip:"리본(ribbon)을 묶어"},
      {en:"rich",ko:"부유한, 풍부한",tip:"돈 많은 rich(부자)"}, {en:"right",ko:"옳은, 오른쪽의",tip:"right(오른쪽)이 옳다"}, {en:"ring",ko:"반지, 울리다",tip:"손가락에 ring(반지)"}, {en:"river",ko:"강",tip:"물 흐르는 river(강)"}, {en:"road",ko:"길, 도로",tip:"road(도로) 위 차"},
      {en:"robot",ko:"로봇",tip:"일하는 기계 robot"}, {en:"rock",ko:"바위, 흔들다",tip:"단단한 rock(바위)"}, {en:"room",ko:"방, 공간",tip:"내 방 room"}, {en:"rose",ko:"장미",tip:"빨간 rose(장미)"}, {en:"run",ko:"달리기, 경영하다",tip:"빨리 run(뛰다)"},
      {en:"sad",ko:"슬픈",tip:"슬픈 sad 영화"}, {en:"safe",ko:"안전한",tip:"safe(안전) 벨트"}, {en:"salad",ko:"샐러드",tip:"야채 가득 salad"}, {en:"sale",ko:"판매, 세일",tip:"판매 sale 중"}, {en:"salt",ko:"소금",tip:"짭짤한 salt(소금)"},
      {en:"same",ko:"같은",tip:"sam(같이) 있어서 같음"}, {en:"sand",ko:"모래",tip:"바닷가 sand(모래)"}, {en:"sandwich",ko:"샌드위치",tip:"sand(모래)+wich(마을)"}, {en:"save",ko:"구하다, 저축하다",tip:"안전하게 save(저장/구출)"}, {en:"say",ko:"말하다",tip:"무엇이라 say(말하다)"},
      {en:"school",ko:"학교",tip:"scho(여가)->공부하는 학교"}, {en:"science",ko:"과학",tip:"sci(알다)+ence=과학"}, {en:"scissors",ko:"가위",tip:"sciss(자르다)+ors=가위"}, {en:"score",ko:"점수, 득점",tip:"새긴(scor) 점수"}, {en:"sea",ko:"바다",tip:"푸른 sea(바다)"},
      {en:"season",ko:"계절",tip:"씨(sea) 뿌리는 시기"}, {en:"second",ko:"두 번째의, 초",tip:"sec(따르다)->두 번째"}, {en:"see",ko:"보다",tip:"눈으로 see(보다)"}, {en:"sell",ko:"팔다",tip:"물건을 sell(팔다)"}, {en:"send",ko:"보내다",tip:"편지를 send(보내다)"},
      {en:"service",ko:"서비스, 봉사",tip:"serv(섬기다)+ice=봉사"}, {en:"set",ko:"놓다, 세우다",tip:"set(두다)=준비하다"}, {en:"seven",ko:"일곱",tip:"seven=숫자 7"}, {en:"she",ko:"그녀",tip:"she=그 여자"}, {en:"ship",ko:"배",tip:"ship(배) 타고 싶다"},
    ]
  },
  {
    id:7, title:"여행의 길", emoji:"✈️",
    color:"#4ADE80", dark:"#15803d",
    desc:"초등 필수 단어 601~700번",
    words:[
      {en:"shirt",ko:"셔츠",tip:"셔츠=shirt"}, {en:"shoe",ko:"신발",tip:"shoe(슈)즈=신발"}, {en:"shop",ko:"상점",tip:"쇼핑(shop)하는 곳"}, {en:"short",ko:"짧은, 키 작은",tip:"short=키가 짧은"}, {en:"should",ko:"~해야 한다",tip:"shall의 과거=의무"},
      {en:"show",ko:"보여주다",tip:"show=쇼를 보여주다"}, {en:"shy",ko:"수줍어하는",tip:"샤이(shy)한=수줍은"}, {en:"sick",ko:"아픈",tip:"sick(식)은 땀 나고 아파"}, {en:"side",ko:"옆면, 쪽",tip:"side=옆쪽"}, {en:"sing",ko:"노래하다",tip:"sing(싱)어=노래하는 이"},
      {en:"sister",ko:"자매, 누이",tip:"sis(여자)+ter(사람)"}, {en:"sit",ko:"앉다",tip:"sit(싯)다운=앉다"}, {en:"six",ko:"여섯",tip:"six=숫자 6"}, {en:"size",ko:"크기",tip:"size=사이즈/크기"}, {en:"skate",ko:"스케이트 타다",tip:"skate=얼음 위 달리기"},
      {en:"ski",ko:"스키 타다",tip:"ski=눈 위에서 타기"}, {en:"skin",ko:"피부",tip:"skin(스킨)=피부"}, {en:"skirt",ko:"치마",tip:"skirt=스커트/치마"}, {en:"sky",ko:"하늘",tip:"sky=스카이/하늘"}, {en:"sleep",ko:"자다",tip:"슬립(sleep)=잠자다"},
      {en:"slow",ko:"느린",tip:"슬로우 모션=느린"}, {en:"small",ko:"작은",tip:"스몰 사이즈=작은"}, {en:"smell",ko:"냄새 맡다",tip:"smell(스멜)=냄새"}, {en:"smile",ko:"미소 짓다",tip:"smile=스마일/웃다"}, {en:"snow",ko:"눈",tip:"snow=하얀 눈"},
      {en:"so",ko:"그래서, 그렇게",tip:"so(쏘)=그렇게/그래서"}, {en:"soccer",ko:"축구",tip:"soc(발)+cer=축구"}, {en:"sock",ko:"양말",tip:"sock(쏙) 신는 양말"}, {en:"soft",ko:"부드러운",tip:"소프트 아이스크림"}, {en:"software",ko:"소프트웨어",tip:"soft(부드러운)+ware"},
      {en:"some",ko:"어떤, 약간의",tip:"some=조금의/어떤"}, {en:"son",ko:"아들",tip:"son=썬/아들"}, {en:"song",ko:"노래",tip:"song(송)=부르는 노래"}, {en:"sorry",ko:"미안한",tip:"쏘리(sorry)=미안함"}, {en:"sound",ko:"소리",tip:"sound=사운드/소리"},
      {en:"soup",ko:"수프",tip:"soup=국물 요리"}, {en:"south",ko:"남쪽",tip:"south=남쪽(S)"}, {en:"space",ko:"공간, 우주",tip:"space=빈 공간/우주"}, {en:"spaghetti",ko:"스파게티",tip:"면 요리=spaghetti"}, {en:"speak",ko:"말하다",tip:"스피커(speak)=말하기"},
      {en:"speed",ko:"속도",tip:"스피드(speed)=빠르기"}, {en:"spoon",ko:"숟가락",tip:"스푼(spoon)=숟가락"}, {en:"sport",ko:"운동, 스포츠",tip:"sport=운동 경기"}, {en:"spring",ko:"봄, 샘",tip:"spring=튀어 오르는 봄"}, {en:"staff",ko:"직원",tip:"스태프(staff)=직원들"},
      {en:"stand",ko:"서다",tip:"stand up=일어서다"}, {en:"star",ko:"별",tip:"star=밤하늘의 별"}, {en:"start",ko:"시작하다",tip:"스타트(start)=시작"}, {en:"stay",ko:"머무르다",tip:"stay(스테이)=남아있다"}, {en:"steak",ko:"스테이크",tip:"steak=구운 고기"},
      {en:"stone",ko:"돌",tip:"stone(스톤)=돌"}, {en:"stop",ko:"멈추다",tip:"stop=정지하다"}, {en:"store",ko:"가게",tip:"store=물건 쌓아둔 가게"}, {en:"story",ko:"이야기",tip:"story(스토리)=이야기"}, {en:"street",ko:"거리",tip:"street=길거리"},
      {en:"strong",ko:"강한",tip:"스트롱(strong)=힘센"}, {en:"study",ko:"공부하다",tip:"study(스터디)=공부"}, {en:"style",ko:"스타일, 모양",tip:"style=맵시/스타일"}, {en:"subway",ko:"지하철",tip:"sub(아래)+way(길)"}, {en:"sugar",ko:"설탕",tip:"슈가(sugar)=설탕"},
      {en:"summer",ko:"여름",tip:"summer=더운 여름"}, {en:"sun",ko:"태양",tip:"sun=해"}, {en:"sure",ko:"확신하는",tip:"sure(슈어)=확실한"}, {en:"swim",ko:"수영하다",tip:"swim=물에서 수영"}, {en:"table",ko:"탁자",tip:"table=테이블/탁자"},
      {en:"tail",ko:"꼬리",tip:"tail(테일)=꼬리"}, {en:"take",ko:"가져가다, 잡다",tip:"take(테이크)=취하다"}, {en:"talk",ko:"말하다",tip:"톡(talk)=이야기하다"}, {en:"tall",ko:"키가 큰",tip:"tall=키가 큰"}, {en:"tape",ko:"테이프",tip:"tape=붙이는 테이프"},
      {en:"taste",ko:"맛보다, 맛",tip:"taste=맛"}, {en:"taxi",ko:"택시",tip:"taxi=타는 택시"}, {en:"teach",ko:"가르치다",tip:"teacher=가르치는 이"}, {en:"team",ko:"팀",tip:"team=함께하는 팀"}, {en:"telephone",ko:"전화기",tip:"tele(멀리)+phone"},
      {en:"television",ko:"텔레비전",tip:"tele(멀리)+vision"}, {en:"tell",ko:"말해주다",tip:"tell(텔) 미=말해줘"}, {en:"ten",ko:"열",tip:"ten=숫자 10"}, {en:"tennis",ko:"테니스",tip:"공 치는 tennis"}, {en:"tent",ko:"텐트",tip:"tent=천막/텐트"},
      {en:"test",ko:"시험",tip:"test=테스트/시험"}, {en:"textbook",ko:"교과서",tip:"text(글)+book(책)"}, {en:"than",ko:"~보다",tip:"than=비교할 때 ~보다"}, {en:"thank",ko:"고마워하다",tip:"thank you=감사"}, {en:"that",ko:"저것",tip:"that=먼 저것"},
      {en:"the",ko:"그",tip:"the=정해진 그"}, {en:"there",ko:"저기에",tip:"there=저곳에"}, {en:"they",ko:"그들",tip:"they=그 사람들"}, {en:"thing",ko:"물건, 것",tip:"thing(띵)=물건/것"}, {en:"think",ko:"생각하다",tip:"think=띵크/생각"},
      {en:"third",ko:"세 번째의",tip:"three(3)의 순서"}, {en:"thirst",ko:"갈증, 목마름",tip:"thirst=목이 타는 갈증"}, {en:"thirteen",ko:"열셋",tip:"thir(3)+teen(10)"}, {en:"thirty",ko:"서른",tip:"thir(3)+ty(10단위)"}, {en:"this",ko:"이것",tip:"this=가까운 이것"},
      {en:"three",ko:"셋",tip:"three=숫자 3"}, {en:"ticket",ko:"표, 입장권",tip:"티켓(표)을 끊다"}, {en:"tiger",ko:"호랑이",tip:"타이거(호랑이) 연고"}, {en:"time",ko:"시간",tip:"타임(시간) 아웃"}, {en:"tire",ko:"타이어, 피곤하게 하다",tip:"피곤하면(tire) 타이어 펑크"},
    ]
  },
  {
    id:8, title:"색과 숫자", emoji:"🎨",
    color:"#4ADE80", dark:"#15803d",
    desc:"초등 필수 단어 701~800번",
    words:[
      {en:"to",ko:"~로, ~까지",tip:"to(방향)+대상=~로"}, {en:"today",ko:"오늘",tip:"to(에)+day(날)=오늘"}, {en:"together",ko:"함께",tip:"to(함께)+gather(모으다)"}, {en:"tomato",ko:"토마토",tip:"토마토(tomato)는 빨개"}, {en:"tomorrow",ko:"내일",tip:"to(에)+morrow(아침)=내일"},
      {en:"tonight",ko:"오늘 밤",tip:"to(에)+night(밤)=오늘밤"}, {en:"too",ko:"또한, 너무",tip:"too(또한) 더해진 것"}, {en:"tooth",ko:"치아, 이",tip:"티(teeth)나게 닦는 이"}, {en:"top",ko:"꼭대기, 위",tip:"톱(top) 클래스=꼭대기"}, {en:"touch",ko:"만지다, 감동시키다",tip:"터치(touch)하다=만지다"},
      {en:"town",ko:"마을, 시내",tip:"타운(town)하우스=마을"}, {en:"toy",ko:"장난감",tip:"토이(toy) 스토리=장난감"}, {en:"track",ko:"길, 경주로, 자국",tip:"트랙(track)을 돌다"}, {en:"train",ko:"기차, 훈련하다",tip:"기차(train) 타고 훈련 가기"}, {en:"travel",ko:"여행, 이동하다",tip:"트래블(travel) 가방"},
      {en:"tree",ko:"나무",tip:"크리스마스 트리(tree)"}, {en:"trip",ko:"여행",tip:"트립(trip)을 떠나다"}, {en:"truck",ko:"트럭",tip:"트럭(truck)에 짐 싣기"}, {en:"true",ko:"진실한, 진짜의",tip:"트루(true) 리얼=진짜"}, {en:"try",ko:"시도하다, 노력하다",tip:"트라이(try) 해봐=시도"},
      {en:"turn",ko:"돌다, 차례",tip:"턴(turn) 하세요=돌기"}, {en:"twelve",ko:"12, 열둘",tip:"트웰브(twelve)=12"}, {en:"twenty",ko:"20, 스물",tip:"트웬티(twenty)=20"}, {en:"twenty-first",ko:"21번째",tip:"20(twenty)+1st(first)"}, {en:"twenty-second",ko:"22번째",tip:"20(twenty)+2nd(second)"},
      {en:"twenty-third",ko:"23번째",tip:"20(twenty)+3rd(third)"}, {en:"twice",ko:"두 번, 두 배로",tip:"트와이스(twice)=두 번"}, {en:"two",ko:"2, 둘",tip:"원, 투(two)=하나, 둘"}, {en:"type",ko:"유형, 종류, 치다",tip:"타입(type)이 맞아=유형"}, {en:"ugly",ko:"못생긴, 추한",tip:"어글리(ugly) 슈즈"},
      {en:"umbrella",ko:"우산",tip:"엄브렐러(umbrella)=우산"}, {en:"uncle",ko:"삼촌, 이모부, 고모부",tip:"엉클(uncle) 톰=삼촌"}, {en:"under",ko:"~아래에",tip:"언더(under) 그라운드"}, {en:"understand",ko:"이해하다",tip:"under(아래)+stand(서다)"}, {en:"up",ko:"위로, 위쪽으로",tip:"업(up) 앤 다운"},
      {en:"use",ko:"사용하다, 이용하다",tip:"유즈(use) 풀=유용한"}, {en:"vegetable",ko:"채소, 야채",tip:"베지터블(vegetable)=채소"}, {en:"very",ko:"매우, 아주",tip:"베리(very) 굿=매우"}, {en:"video",ko:"비디오, 영상",tip:"비디오(video) 영상"}, {en:"violin",ko:"바이올린",tip:"바이올린(violin) 켜기"},
      {en:"visit",ko:"방문하다",tip:"vis(보다)+it(가다)=방문"}, {en:"voice",ko:"목소리",tip:"보이스(voice) 코리아"}, {en:"wait",ko:"기다리다",tip:"웨이트(wait) 타임=대기"}, {en:"wake",ko:"깨다, 깨우다",tip:"웨이크(wake) 업=깨다"}, {en:"walk",ko:"걷다, 산책시키다",tip:"워킹(walk) 슈즈=걷기"},
      {en:"wall",ko:"벽, 담",tip:"월(wall) 페이퍼=벽지"}, {en:"want",ko:"원하다",tip:"원트(want)=원하다"}, {en:"war",ko:"전쟁",tip:"스타 워즈(war)=전쟁"}, {en:"warm",ko:"따뜻한",tip:"웜(warm) 톤=따뜻함"}, {en:"wash",ko:"씻다, 세탁하다",tip:"워시(wash) 오프=씻다"},
      {en:"watch",ko:"보다, 시계",tip:"왓치(watch) 아웃=조심"}, {en:"water",ko:"물",tip:"워터(water) 파크=물"}, {en:"watermelon",ko:"수박",tip:"water(물)+melon(멜론)"}, {en:"way",ko:"길, 방법",tip:"마이 웨이(way)=내 길"}, {en:"we",ko:"우리",tip:"위(we) 아 더 원"},
      {en:"wear",ko:"입다, 쓰고 있다",tip:"웨어(wear)러블=입는"}, {en:"weather",ko:"날씨",tip:"웨더(weather) 뉴스"}, {en:"website",ko:"웹사이트",tip:"web(망)+site(장소)"}, {en:"wedding",ko:"결혼, 결혼식",tip:"웨딩(wedding) 드레스"}, {en:"week",ko:"주, 일주일",tip:"위크(week) 엔드=주말"},
      {en:"weekend",ko:"주말",tip:"week(주)+end(끝)=주말"}, {en:"weight",ko:"무게, 체중",tip:"웨이트(weight) 트레이닝"}, {en:"welcome",ko:"환영하다, 천만에요",tip:"wel(잘)+come(오다)"}, {en:"well",ko:"잘, 건강한, 우물",tip:"웰(well) 빙=잘 사는"}, {en:"west",ko:"서쪽",tip:"웨스트(west) 사이드"},
      {en:"wet",ko:"젖은",tip:"웨트(wet) 티슈=물티슈"}, {en:"what",ko:"무엇, 어떤 것",tip:"왓(what)이 뭐야?"}, {en:"when",ko:"언제, ~할 때",tip:"웬(when) 일이야?=언제"}, {en:"where",ko:"어디에",tip:"웨어(where) 아 유?"}, {en:"white",ko:"하얀색",tip:"화이트(white) 크리스마스"},
      {en:"who",ko:"누구",tip:"후(who) 아 유?"}, {en:"why",ko:"왜",tip:"와이(why) 책=왜?"}, {en:"wife",ko:"아내",tip:"와이프(wife)=아내"}, {en:"will",ko:"~할 것이다, 의지",tip:"윌(will) 파워=의지"}, {en:"win",ko:"이기다, 따내다",tip:"윈(win)윈 전략=이기다"},
      {en:"wind",ko:"바람",tip:"윈드(wind) 브레이커"}, {en:"window",ko:"창문",tip:"윈도우(window) 정품"}, {en:"wine",ko:"와인, 포도주",tip:"와인(wine) 한 잔"}, {en:"winter",ko:"겨울",tip:"윈터(winter) 가 오다"}, {en:"wish",ko:"바라다, 소원",tip:"위시(wish) 리스트"},
      {en:"with",ko:"~와 함께, ~로",tip:"위드(with) 코로나"}, {en:"woman",ko:"여자",tip:"우먼(woman) 파워"}, {en:"wood",ko:"나무, 목재",tip:"우드(wood) 퍼니처"}, {en:"word",ko:"단어, 말",tip:"워드(word) 프로세서"}, {en:"work",ko:"일하다, 공부하다, 작품",tip:"워크(work) 홀릭"},
      {en:"world",ko:"세상, 세계",tip:"월드(world) 컵=세계"}, {en:"worry",ko:"걱정하다",tip:"워리(worry) 비 해피"}, {en:"write",ko:"쓰다",tip:"라이트(write) 하기"}, {en:"wrong",ko:"틀린, 잘못된",tip:"롱(wrong) 답변=틀린"}, {en:"year",ko:"년, 해, 나이",tip:"해피 뉴 이어(year)"},
      {en:"yellow",ko:"노란색",tip:"옐로우(yellow) 카드"}, {en:"yes",ko:"네, 예",tip:"예스(yes)라고 대답해"}, {en:"yesterday",ko:"어제",tip:"yester(어제)+day(날)"}, {en:"you",ko:"너, 당신",tip:"아이 러브 유(you)"}, {en:"young",ko:"젊은, 어린",tip:"영(young) 포에버"},
      {en:"zoo",ko:"동물원",tip:"쥬(zoo)라기 공원"},
    ]
  },
  {
    id:9, title:"학문의 탑", emoji:"🏛️",
    color:"#60A5FA", dark:"#1d4ed8",
    desc:"중고등 필수 단어 1~200번",
    words:[
      {en:"able",ko:"할 수 있는",tip:"할 수 있는 능력을 갖춘"}, {en:"absolute",ko:"절대적인",tip:"ab(떨어져)+solut(풀린)=절대적"}, {en:"accent",ko:"강세, 억양",tip:"ac(강조)+cent(노래)=강세"}, {en:"accept",ko:"받아들이다",tip:"ac(향해)+cept(잡다)=받아들이다"}, {en:"access",ko:"접근",tip:"ac(향해)+cess(가다)=접근"},
      {en:"accident",ko:"사고",tip:"ac(향해)+cid(떨어지다)=사고"}, {en:"account",ko:"설명, 계좌",tip:"ac(향해)+count(세다)=설명"}, {en:"accuse",ko:"비난하다, 고발하다",tip:"ac(향해)+cuse(죄)=고발하다"}, {en:"achieve",ko:"성취하다",tip:"a(향해)+chief(머리)=끝에 도달"}, {en:"adapt",ko:"적응하다",tip:"ad(향해)+apt(적합한)=적응"},
      {en:"admire",ko:"존경하다",tip:"ad(향해)+mire(놀라다)=존경"}, {en:"admit",ko:"인정하다, 허락하다",tip:"ad(향해)+mit(보내다)=입장허가"}, {en:"adopt",ko:"채택하다, 입양하다",tip:"ad(향해)+opt(선택)=입양"}, {en:"advance",ko:"전진, 발전",tip:"ad(향해)+van(앞)=전진"}, {en:"advantage",ko:"이점, 장점",tip:"ad(향해)+van(앞)=유리함"},
      {en:"adventure",ko:"모험",tip:"ad(향해)+vent(오다)=모험"}, {en:"advice",ko:"조언",tip:"ad(향해)+vice(보다)=조언"}, {en:"advise",ko:"조언하다",tip:"ad(향해)+vise(보다)=충고하다"}, {en:"affair",ko:"사건, 일",tip:"af(향해)+fair(하다)=일어난 일"}, {en:"affect",ko:"영향을 미치다",tip:"af(향해)+fect(만들다)=영향"},
      {en:"afford",ko:"여유가 되다",tip:"af(향해)+forth(앞으로)=여유"}, {en:"agent",ko:"대리인",tip:"ag(행하다)+ent(사람)=대리인"}, {en:"aid",ko:"도움, 원조",tip:"ad(향해)+iuvare(돕다)=도움"}, {en:"aim",ko:"목표, 겨냥하다",tip:"과녁(target)을 겨냥함"}, {en:"airline",ko:"항공사",tip:"air(공중)+line(선)=항로/회사"},
      {en:"airport",ko:"공항",tip:"air(공중)+port(항구)=공항"}, {en:"alarm",ko:"경보, 알람",tip:"al(에)+arm(무기)=무장하라!"}, {en:"alcohol",ko:"술, 알코올",tip:"술의 취하게 하는 성분"}, {en:"alive",ko:"살아있는",tip:"a(상태)+live(살다)=살아있는"}, {en:"allow",ko:"허락하다",tip:"al(향해)+low(할당)=허가"},
      {en:"aloud",ko:"큰 소리로",tip:"a(상태)+loud(큰소리)=크게"}, {en:"alter",ko:"바꾸다",tip:"alter(다른)=다르게 바꾸다"}, {en:"although",ko:"~일지라도",tip:"al(완전)+though(비록)=비록"}, {en:"altogether",ko:"완전히, 모두 합쳐",tip:"all(모두)+together(함께)"}, {en:"amaze",ko:"놀라게 하다",tip:"a(상태)+maze(미로)=놀람"},
      {en:"ambulance",ko:"구급차",tip:"ambul(걷다)=이동하는 병원"}, {en:"among",ko:"~사이에",tip:"a(상태)+mong(섞임)=~중에"}, {en:"amount",ko:"양, 총액",tip:"a(향해)+mount(산)=총액/양"}, {en:"amuse",ko:"즐겁게 하다",tip:"a(상태)+muse(생각)=즐거움"}, {en:"analysis",ko:"분석",tip:"ana(위로)+lysis(풀다)=분석"},
      {en:"angel",ko:"천사",tip:"하늘의 심부름꾼(angel)"}, {en:"anger",ko:"화, 분노",tip:"ang(좁은/고통)=화가 남"}, {en:"announce",ko:"발표하다, 알리다",tip:"an(향해)+nounce(말하다)=발표"}, {en:"annoy",ko:"짜증나게 하다",tip:"in(안에)+odio(증오)=괴롭힘"}, {en:"annual",ko:"매년의",tip:"ann(해)+ual(의)=1년의"},
      {en:"ant",ko:"개미",tip:"부지런히 일하는 곤충"}, {en:"anxious",ko:"불안해하는, 갈망하는",tip:"ang(좁음)=숨막히는 불안"}, {en:"apart",ko:"떨어져서",tip:"a(상태)+part(부분)=따로"}, {en:"appeal",ko:"호소하다, 매력",tip:"ap(향해)+peal(치다)=마음을 침"}, {en:"appear",ko:"나타나다",tip:"ap(향해)+pear(보이다)=나타남"},
      {en:"apply",ko:"지원하다, 적용하다",tip:"ap(향해)+ply(접다)=붙이다"}, {en:"appoint",ko:"임명하다, 정하다",tip:"ap(향해)+point(점)=지정"}, {en:"appreciate",ko:"감사하다, 감상하다",tip:"ap(향해)+preci(가치)=인정"}, {en:"approach",ko:"접근하다",tip:"ap(향해)+proach(가까운)=접근"}, {en:"appropriate",ko:"적절한",tip:"ap(향해)+propri(자신의)=고유의"},
      {en:"argue",ko:"논쟁하다",tip:"argu(밝히다)=증명하려 다툼"}, {en:"army",ko:"군대",tip:"arm(무기)+y(모임)=군대"}, {en:"arrange",ko:"정리하다, 배열하다",tip:"ar(향해)+range(줄)=배열"}, {en:"arrest",ko:"체포하다",tip:"ar(향해)+rest(멈춤)=체포"}, {en:"article",ko:"기사, 물건",tip:"art(마디)+icle(작은)=토막글"},
      {en:"aside",ko:"옆에, 제쳐두고",tip:"a(상태)+side(옆)=옆으로"}, {en:"asleep",ko:"잠든",tip:"a(상태)+sleep(자다)=잠든"}, {en:"assess",ko:"평가하다",tip:"as(옆에)+sess(앉다)=조사"}, {en:"assign",ko:"배정하다, 할당하다",tip:"as(향해)+sign(표시)=할당"}, {en:"assist",ko:"돕다",tip:"as(옆에)+sist(서다)=돕다"},
      {en:"associate",ko:"연상하다, 동료",tip:"as(향해)+soci(동료)=연결"}, {en:"assume",ko:"가정하다",tip:"as(향해)+sume(취하다)=생각함"}, {en:"atmosphere",ko:"분위기, 대기",tip:"atmo(증기)+sphere(구)=대기"}, {en:"attach",ko:"붙이다, 첨부하다",tip:"at(향해)+tach(말뚝)=붙이다"}, {en:"attack",ko:"공격하다",tip:"at(향해)+tack(찌르다)=공격"},
      {en:"attempt",ko:"시도하다",tip:"at(향해)+tempt(시험)=시도"}, {en:"attend",ko:"참석하다, 주의하다",tip:"at(향해)+tend(뻗다)=참석"}, {en:"attention",ko:"주의, 집중",tip:"at(향해)+tent(뻗다)=주의"}, {en:"attitude",ko:"태도",tip:"apt(적합)+itude(상태)=태도"}, {en:"attract",ko:"마음을 끌다",tip:"at(향해)+tract(끌다)=매혹"},
      {en:"audience",ko:"청중, 관객",tip:"audi(듣다)+ence(사람)=청중"}, {en:"automatic",ko:"자동의",tip:"auto(스스로)+matic(동작)=자동"}, {en:"average",ko:"평균",tip:"aver(손실분담)=평균"}, {en:"avoid",ko:"피하다",tip:"a(상태)+void(비어있는)=피하다"}, {en:"awake",ko:"깨어 있는",tip:"a(상태)+wake(깨다)=깨어있는"},
      {en:"award",ko:"상, 수여하다",tip:"a(향해)+ward(보다)=수여"}, {en:"aware",ko:"알고 있는",tip:"a(상태)+ware(주의)=자각"}, {en:"awkward",ko:"어색한, 서투른",tip:"awk(반대)+ward(방향)=어색"}, {en:"background",ko:"배경",tip:"back(뒤)+ground(땅)=배경"}, {en:"bacon",ko:"베이컨",tip:"돼지 옆구리 고기"},
      {en:"balance",ko:"균형",tip:"bi(둘)+lanx(접시)=천칭"}, {en:"balloon",ko:"풍선",tip:"ball(공)+oon(큰)=풍선"}, {en:"band",ko:"끈, 밴드",tip:"묶어주는 것(bind)"}, {en:"bang",ko:"쾅 소리 나다",tip:"쾅 소리 나는 의성어"}, {en:"bar",ko:"막대, 술집",tip:"가로막는 막대"},
      {en:"bare",ko:"벌거벗은",tip:"숨김 없이 드러난"}, {en:"bark",ko:"짖다",tip:"개가 짖는 소리"}, {en:"basis",ko:"기초, 근거",tip:"bas(바닥)=기초"}, {en:"battery",ko:"배터리, 건전지",tip:"batt(치다)=두드려 만든 더미"}, {en:"battle",ko:"전투",tip:"batt(치다)+le(반복)=싸움"},
      {en:"bay",ko:"만(灣)",tip:"육지로 쑥 들어온 바다"}, {en:"bean",ko:"콩",tip:"콩 심은 데 콩 난다"}, {en:"beat",ko:"때리다, 이기다",tip:"박자에 맞춰 치다"}, {en:"beer",ko:"맥주",tip:"보리로 만든 술"}, {en:"beg",ko:"간청하다, 구걸하다",tip:"배(be)+그(g)렇게 빌다->간청"},
      {en:"belief",ko:"믿음, 신념",tip:"be(있다)+lief(사랑)->믿음"}, {en:"belong",ko:"~에 속하다",tip:"be(있다)+long(따라)->속하다"}, {en:"bench",ko:"긴 의자, 벤치",tip:"벤치(bench)에 앉아 쉬자"}, {en:"bend",ko:"구부리다, 굽히다",tip:"밴드(band)처럼 \'벤드\' 구부리기"}, {en:"beneath",ko:"~의 아래에",tip:"be(있다)+neath(아래)->~아래"},
      {en:"benefit",ko:"이득, 혜택",tip:"bene(좋은)+fit(만들다)=이익"}, {en:"bet",ko:"돈을 걸다, 확신하다",tip:"배팅(bet)하자! 내기하다"}, {en:"beyond",ko:"~을 너머, ~ 이상",tip:"be(있다)+yond(저쪽)=넘어서"}, {en:"billion",ko:"10억",tip:"bi(2)+illion(백만)->10억"}, {en:"bin",ko:"쓰레기통",tip:"빈(bin) 통은 쓰레기통"},
      {en:"bind",ko:"묶다, 결속시키다",tip:"바인드(bind)로 꽁꽁 묶다"}, {en:"bit",ko:"조금, 약간",tip:"조금 \'비트(bit)\' 주세요"}, {en:"bite",ko:"물다, 한 입",tip:"바이트(bite) 한 입 물기"}, {en:"bitter",ko:"쓴, 격렬한",tip:"비터(bitter)맛은 너무 써!"}, {en:"blame",ko:"비난하다, ~의 탓으로 돌리다",tip:"불(b)+레임(lame:불구)->비난"},
      {en:"blank",ko:"빈칸, 멍한",tip:"블랭크(blank)는 텅 빈 칸"}, {en:"blanket",ko:"담요",tip:"blank(빈)+et(것)->덮는 담요"}, {en:"bless",ko:"축복하다",tip:"블레스(bless) 유! 축복해!"}, {en:"blind",ko:"눈이 먼, 맹인용 블라인드",tip:"불(b)+라인드(line:선)->눈먼"}, {en:"block",ko:"막다, 덩어리",tip:"블록(block)으로 길을 막다"},
      {en:"blonde",ko:"금발의",tip:"블론드(blonde) 머리색"}, {en:"bloom",ko:"꽃이 피다",tip:"꽃이 \'블룸(bloom)\' 피어나다"}, {en:"blow",ko:"불다, 일격",tip:"바람이 \'블로우(blow)\' 불다"}, {en:"boil",ko:"끓이다, 삶다",tip:"\'보일(boil)\' 듯 끓는 물"}, {en:"bomb",ko:"폭탄, 폭격하다",tip:"붐(boom) 터지는 밤(bomb)"},
      {en:"bond",ko:"결속, 채권",tip:"본드(bond)로 딱 붙어 결속"}, {en:"boom",ko:"쾅 소리, 호황",tip:"붐(boom) 일어나는 호황"}, {en:"boot",ko:"장화, 부팅하다",tip:"부츠(boots) 한 짝은 부트"}, {en:"bore",ko:"지루하게 하다",tip:"보어(bore)하다 지루해!"}, {en:"boss",ko:"상사, 보스",tip:"보스(boss)는 나의 상사"},
      {en:"bother",ko:"괴롭히다, 신경 쓰다",tip:"바더(bother)는 귀찮게 해"}, {en:"bounce",ko:"튀어 오르다",tip:"바운스(bounce) 심장이 뛰어"}, {en:"bow",ko:"절하다, 활",tip:"바우(bow) 하고 정중히 절"}, {en:"bowl",ko:"그릇, 사발",tip:"보울(bowl)에 담긴 시리얼"}, {en:"brain",ko:"뇌, 지능",tip:"브레인(brain)은 똑똑한 뇌"},
      {en:"brake",ko:"브레이크, 제동을 걸다",tip:"멈출 땐 브레이크(brake)"}, {en:"branch",ko:"나뭇가지, 지점",tip:"브랜치(branch)는 가지/지점"}, {en:"brand",ko:"상표, 브랜드",tip:"브랜드(brand) 있는 가방"}, {en:"breast",ko:"가슴",tip:"브레스트(breast)는 가슴"}, {en:"breath",ko:"숨, 호흡",tip:"\'브레스(breath)\' 숨 한번"},
      {en:"breathe",ko:"숨쉬다",tip:"브리드(breathe) 숨을 쉬자"}, {en:"brick",ko:"벽돌",tip:"브릭(brick) 장난감 벽돌"}, {en:"brief",ko:"짧은, 잠시 동안의",tip:"브리핑(brief)은 짧게 하기"}, {en:"brilliant",ko:"훌륭한, 빛나는",tip:"브릴리언트(brilliant) 빛나"}, {en:"broad",ko:"넓은",tip:"브로드(broad)한 넓은 대역"},
      {en:"bubble",ko:"거품",tip:"버블(bubble) 거품 목욕"}, {en:"budget",ko:"예산",tip:"버짓(budget)은 가계부 예산"}, {en:"bug",ko:"벌레, 괴롭히다",tip:"버그(bug) 잡는 벌레 사냥"}, {en:"bump",ko:"부딪히다, 혹",tip:"범퍼(bump)카끼리 쿵 충돌"}, {en:"bunch",ko:"다발, 묶음",tip:"번치(bunch) 꽃 한 다발"},
      {en:"burst",ko:"터지다, 폭발하다",tip:"버스트(burst) 빵 터지다"}, {en:"bury",ko:"묻다, 매장하다",tip:"베리(bury)를 땅에 묻다"}, {en:"bush",ko:"덤불, 관목",tip:"덤불 속에 숨은 부시(bush)"}, {en:"cable",ko:"전선, 케이블",tip:"케이블(cable) 선 연결하기"}, {en:"cage",ko:"우리, 새장",tip:"케이지(cage) 안의 동물들"},
      {en:"calculate",ko:"계산하다",tip:"calcul(조약돌)+ate->계산"}, {en:"calendar",ko:"달력",tip:"캘린더(calendar) 날짜 확인"}, {en:"calm",ko:"침착한, 진정시키다",tip:"캄(calm)하게 가라앉히다"}, {en:"capable",ko:"능력 있는",tip:"cap(잡다)+able=능력 있는"}, {en:"cape",ko:"망토, 곶",tip:"망토 두른 케이프(cape)"},
      {en:"capital",ko:"수도, 자본, 대문자의",tip:"capit(머리)+al=으뜸 수도"}, {en:"captain",ko:"선장, 대위, 주장",tip:"캡틴(captain)은 우두머리"}, {en:"career",ko:"직업, 경력",tip:"커리어(career)를 쌓다"}, {en:"carpet",ko:"카펫",tip:"카펫(carpet)을 깔다"}, {en:"cart",ko:"수레, 카트",tip:"쇼핑 카트(cart)를 밀다"},
      {en:"cast",ko:"던지다, 배역을 정하다",tip:"캐스트(cast) 배역을 던지다"}, {en:"castle",ko:"성",tip:"캐슬(castle)은 멋진 성"}, {en:"catalogue",ko:"목록, 카탈로그",tip:"카탈로그(catalog) 보고 골라"}, {en:"category",ko:"범주, 카테고리",tip:"cata(아래)+gory(광장)->분류"}, {en:"cause",ko:"원인, 일으키다",tip:"코즈(cause)가 결과를 만듦"},
      {en:"ceiling",ko:"천장",tip:"실링(ceiling) 팬은 천장에"}, {en:"cell",ko:"세포, 감방",tip:"셀(cell)은 작은 세포"}, {en:"century",ko:"세기, 100년",tip:"cent(100)+ury=100년"}, {en:"chain",ko:"사슬, 체인",tip:"체인(chain)으로 연결해"}, {en:"chairman",ko:"의장, 회장",tip:"chair(의자)+man=회장"},
      {en:"challenge",ko:"도전, 이의를 제기하다",tip:"챌린지(challenge)에 도전"}, {en:"champion",ko:"우승자, 옹호하다",tip:"챔피언(champion)은 1등"}, {en:"channel",ko:"경로, 채널",tip:"채널(channel) 돌리지 마"}, {en:"character",ko:"성격, 특징, 등장인물",tip:"캐릭터(character) 확실하네"}, {en:"characteristic",ko:"특징, 특유의",tip:"character(특징)+istic->특유의"},
      {en:"charge",ko:"요금, 충전, 책임",tip:"차지(charge)해서 충전/청구"}, {en:"charm",ko:"매력, 부적",tip:"샴(charm)한 그녀는 매력적"}, {en:"chart",ko:"도표, 차트",tip:"차트(chart) 보고 분석하기"}, {en:"chase",ko:"쫓다, 추적하다",tip:"체이스(chase)하며 추격"}, {en:"chat",ko:"수다, 채팅하다",tip:"채팅(chat)하며 수다 떨기"},
      {en:"cheek",ko:"뺨, 볼",tip:"치크(cheek) 볼 터치"}, {en:"cheer",ko:"응원하다, 환호",tip:"치어(cheer) 리더의 응원"}, {en:"chest",ko:"가슴, 상자",tip:"체스트(chest)는 가슴팍"}, {en:"chew",ko:"씹다",tip:"츄잉(chew) 껌을 씹다"}, {en:"chief",ko:"주요한, 우두머리",tip:"치프(chief)는 대장/주요한"},
      {en:"chip",ko:"조각, 칩",tip:"칩(chip)은 작은 조각"}, {en:"choice",ko:"선택",tip:"초이스(choice)를 잘 해봐"}, {en:"chop",ko:"썰다, 자르다",tip:"찹(chop)스테이크는 썬 고기"}, {en:"cigarette",ko:"담배",tip:"cigar(담배)+ette(작은)=담배"}, {en:"cinema",ko:"영화관",tip:"시네마(cinema)에서 영화 봐"},
      {en:"circumstance",ko:"상황, 환경",tip:"circum(주변)+stance=상황"}, {en:"citizen",ko:"시민",tip:"city(도시)+zen(사람)=시민"}, {en:"civil",ko:"시민의, 예의 바른",tip:"시빌(civil) 시민의 권리"}, {en:"claim",ko:"주장하다, 요구하다",tip:"클레임(claim) 걸어 주장해"}, {en:"clerk",ko:"점원, 사무원",tip:"cler(기록자)=사무원"},
    ]
  },
  {
    id:10, title:"감정의 궁전", emoji:"💙",
    color:"#60A5FA", dark:"#1d4ed8",
    desc:"중고등 필수 단어 201~400번",
    words:[
      {en:"click",ko:"딸깍 소리가 나다, 클릭하다",tip:"마우스 딸깍 소리"}, {en:"client",ko:"고객, 의뢰인",tip:"cli(기대다)=의지하는 고객"}, {en:"cliff",ko:"벼랑, 절벽",tip:"떨어지면 클리(나)프다"}, {en:"climate",ko:"기후",tip:"cli(기울기)=해의 기울기"}, {en:"clip",ko:"클립, 깎다, 고정하다",tip:"종이를 clip 끼우다"},
      {en:"clue",ko:"단서, 실마리",tip:"실 뭉치에서 나온 단서"}, {en:"coach",ko:"코치, 지도하다, 마차",tip:"가야할 길을 코치하다"}, {en:"coal",ko:"석탄",tip:"코(가) 올(black) 석탄"}, {en:"coast",ko:"해안",tip:"바닷가 코스(course)"}, {en:"code",ko:"암호, 규범",tip:"cod(나무판)=법전"},
      {en:"coin",ko:"동전",tip:"지갑 속 코인"}, {en:"combine",ko:"결합하다",tip:"com(함께)+bi(둘)=합치다"}, {en:"comedy",ko:"코미디, 희극",tip:"com(잔치)+edy(노래)"}, {en:"comfort",ko:"위로, 편안함",tip:"com(강조)+fort(힘)=격려"}, {en:"command",ko:"명령하다",tip:"com(강조)+mand(맡기다)"},
      {en:"comment",ko:"논평, 언급",tip:"com(함께)+ment(마음/말)"}, {en:"commerce",ko:"상업, 무역",tip:"com(함께)+merce(물건)"}, {en:"committee",ko:"위원회",tip:"com(함께)+mit(보내다)"}, {en:"common",ko:"공통의, 보통의",tip:"com(함께)+mon(의무/공유)"}, {en:"communicate",ko:"의사소통하다",tip:"commun(공통)+icate(하다)"},
      {en:"community",ko:"지역사회, 공동체",tip:"commun(공통)+ity(상태)"}, {en:"compare",ko:"비교하다",tip:"com(함께)+pare(동등)"}, {en:"complain",ko:"불평하다",tip:"com(강조)+plain(울다)"}, {en:"complete",ko:"완전한, 완성하다",tip:"com(강조)+ple(채우다)"}, {en:"complex",ko:"복잡한, 단지",tip:"com(함께)+plex(엮다)"},
      {en:"complicate",ko:"복잡하게 하다",tip:"com(함께)+plic(접다)"}, {en:"concentrate",ko:"집중하다",tip:"con(함께)+centr(중심)"}, {en:"concept",ko:"개념",tip:"con(함께)+cept(잡다)"}, {en:"concern",ko:"걱정, 관계",tip:"con(함께)+cern(보다)"}, {en:"concert",ko:"콘서트, 협동",tip:"con(함께)+cert(조화)"},
      {en:"confirm",ko:"확인하다",tip:"con(강조)+firm(단단한)"}, {en:"conflict",ko:"갈등, 충돌",tip:"con(함께)+flict(때리다)"}, {en:"confuse",ko:"혼란시키다",tip:"con(함께)+fuse(붓다)"}, {en:"connect",ko:"연결하다",tip:"con(함께)+nect(묶다)"}, {en:"conscious",ko:"의식하는",tip:"con(함께)+sci(알다)"},
      {en:"consider",ko:"고려하다",tip:"con(함께)+sider(별)"}, {en:"constant",ko:"끊임없는",tip:"con(함께)+st(서다)"}, {en:"contact",ko:"접촉, 연락",tip:"con(함께)+tact(만지다)"}, {en:"contain",ko:"포함하다",tip:"con(함께)+tain(잡다)"}, {en:"content",ko:"내용물, 만족하는",tip:"con(완전히)+tent(잡다)"},
      {en:"contest",ko:"경쟁, 대회",tip:"con(함께)+test(시험)"}, {en:"context",ko:"맥락, 문맥",tip:"con(함께)+text(글)"}, {en:"continue",ko:"계속하다",tip:"con(함께)+tin(잡다)"}, {en:"contract",ko:"계약, 수축하다",tip:"con(함께)+tract(끌다)"}, {en:"contribute",ko:"기여하다",tip:"con(함께)+tribute(주다)"},
      {en:"converse",ko:"대화하다, 반대의",tip:"con(함께)+verse(돌다)"}, {en:"convince",ko:"확신시키다",tip:"con(완전히)+vince(이기다)"}, {en:"cop",ko:"경찰",tip:"범인을 콕(cop) 잡는 경찰"}, {en:"cope",ko:"대처하다, 맞서다",tip:"코(cope) 맞대고 대처"}, {en:"copy",ko:"복사, 복제",tip:"co(함께)+py(풍요)"},
      {en:"correct",ko:"옳은, 수정하다",tip:"cor(강조)+rect(바른)"}, {en:"cottage",ko:"오두막, 시골집",tip:"cott(오두막)+age(장소)"}, {en:"cotton",ko:"면, 솜",tip:"꽃(cot)에서 딴 솜(ton)"}, {en:"cough",ko:"기침",tip:"컥(cough) 하는 기침"}, {en:"council",ko:"의회, 협의회",tip:"coun(함께)+cil(부르다)"},
      {en:"countryside",ko:"시골",tip:"country(나라)+side(쪽)"}, {en:"county",ko:"(미국의) 군, 주",tip:"백작(count)의 영지"}, {en:"crack",ko:"갈라진 틈, 깨지다",tip:"크랙 가며 갈라지다"}, {en:"crash",ko:"충돌, 추락",tip:"콰광(crash) 충돌"}, {en:"crawl",ko:"기어가다",tip:"크롤링하며 기어가기"},
      {en:"create",ko:"창조하다",tip:"cre(자라다)=생겨나게 함"}, {en:"credit",ko:"신용, 학점",tip:"cred(믿다)=신용"}, {en:"crime",ko:"범죄",tip:"심판(cri) 받을 죄"}, {en:"crisis",ko:"위기",tip:"판단(cri)의 순간인 위기"}, {en:"crisp",ko:"바삭바삭한",tip:"크리스피 과자"},
      {en:"crowd",ko:"군중, 무리",tip:"크라우드 펀딩=군중"}, {en:"crown",ko:"왕관",tip:"크라운 산도=왕관"}, {en:"cruel",ko:"잔혹한",tip:"크루엘라는 잔혹해"}, {en:"cure",ko:"치료하다",tip:"care(돌봄)해서 cure"}, {en:"curious",ko:"궁금한",tip:"cur(관심)+ious(많은)"},
      {en:"curl",ko:"곱슬곱슬하게 하다",tip:"머리 컬(curl)을 살려요"}, {en:"current",ko:"현재의, 흐름",tip:"cur(흐르다)=지금 흐름"}, {en:"cute",ko:"귀여운",tip:"큐트한 귀요미"}, {en:"cycle",ko:"순환, 자전거",tip:"cyc(원)=도는 것"}, {en:"damage",ko:"손상, 피해",tip:"dam(손실)+age(상태)"},
      {en:"dare",ko:"감히 ~하다",tip:"대(dare)담하게 감히 함"}, {en:"darling",ko:"사랑하는 사람",tip:"dear(귀한)+ling(사람)"}, {en:"dawn",ko:"새벽",tip:"동(dawn) 트는 새벽"}, {en:"deal",ko:"다루다, 거래",tip:"빅 딜(deal)=큰 거래"}, {en:"debate",ko:"토론, 논쟁",tip:"de(강하게)+bate(때리다)"},
      {en:"debt",ko:"빚, 부채",tip:"deb(남겨진 것)=빚"}, {en:"deck",ko:"갑판, 층",tip:"배의 데크(deck)"}, {en:"decorate",ko:"장식하다",tip:"decor(우아함)+ate(하다)"}, {en:"define",ko:"정의하다",tip:"de(강조)+fine(끝/한계)"}, {en:"definite",ko:"확실한",tip:"de(강조)+fin(끝)=분명한"},
      {en:"degree",ko:"정도, 학위",tip:"de(아래)+gree(단계)"}, {en:"delay",ko:"지연시키다",tip:"de(멀리)+lay(두다)"}, {en:"delight",ko:"기쁨",tip:"de(강조)+light(빛)"}, {en:"deliver",ko:"배달하다",tip:"de(멀리)+liver(풀어주다)"}, {en:"demand",ko:"요구하다",tip:"de(강하게)+mand(맡기다)"},
      {en:"demonstrate",ko:"입증하다, 시위하다",tip:"de(완전히)+monstr(보이다)"}, {en:"dentist",ko:"치과의사",tip:"dent(이)+ist(사람)"}, {en:"deny",ko:"부인하다",tip:"de(완전히)+ny(no)"}, {en:"depress",ko:"우울하게 하다",tip:"de(아래)+press(누르다)"}, {en:"describe",ko:"묘사하다",tip:"de(아래)+scribe(쓰다)"},
      {en:"desert",ko:"사막",tip:"de(강조)+sert(잇다)->다 버려진 땅"}, {en:"deserve",ko:"~할 가치가 있다",tip:"de(강조)+serve(봉사)->봉사 받을 자격"}, {en:"desire",ko:"갈망하다",tip:"de(강조)+sire(별)->별을 바라며 원하다"}, {en:"desperate",ko:"필사적인",tip:"de(부정)+sperate(희망)->절박함"}, {en:"despite",ko:"~에도 불구하고",tip:"de(아래로)+spite(보다)->업신여김"},
      {en:"destroy",ko:"파괴하다",tip:"de(반대)+stroy(쌓다)->허물다"}, {en:"detail",ko:"세부 사항",tip:"de(강조)+tail(자르다)->잘게 자름"}, {en:"detect",ko:"발견하다",tip:"de(반대)+tect(덮다)->덮개 열기"}, {en:"determine",ko:"결정하다",tip:"de(강조)+termine(끝)->끝을 맺다"}, {en:"develop",ko:"발전시키다",tip:"de(반대)+velop(싸다)->풀어서 키움"},
      {en:"diary",ko:"일기",tip:"di(날)+ary(장소)->매일 적는 곳"}, {en:"dictionary",ko:"사전",tip:"dict(말)+ionary(장소)->말 모음집"}, {en:"diet",ko:"식단, 다이어트",tip:"die(죽다)+t->죽을 각오로 살 빼기"}, {en:"dig",ko:"파다",tip:"d(땅)+ig(이그)->땅을 이그이그 파다"}, {en:"direct",ko:"직접적인",tip:"di(강조)+rect(똑바른)->똑바로 향함"},
      {en:"dirt",ko:"먼지, 흙",tip:"d(더러운)+irt->더러운 흙과 먼지"}, {en:"disappoint",ko:"실망시키다",tip:"dis(반대)+appoint(약속)->약속 깨짐"}, {en:"disc",ko:"원반",tip:"d(둥근)+isc->둥근 모양의 판"}, {en:"discipline",ko:"훈련, 규율",tip:"discip(배우다)+line->학생의 도리"}, {en:"disgust",ko:"혐오감",tip:"dis(반대)+gust(맛)->맛없어 역겨움"},
      {en:"dish",ko:"접시, 요리",tip:"d(접시)+ish->식탁 위의 요리"}, {en:"display",ko:"전시하다",tip:"dis(반대)+play(접다)->펴서 보이다"}, {en:"distance",ko:"거리",tip:"di(멀리)+stance(서다)->멀리 선 사이"}, {en:"district",ko:"구역",tip:"di(따로)+strict(묶다)->따로 묶음"}, {en:"disturb",ko:"방해하다",tip:"dis(강조)+turb(어지럽히다)->방해"},
      {en:"dive",ko:"뛰어들다",tip:"d(깊게)+ive->물속으로 다이빙"}, {en:"divide",ko:"나누다",tip:"di(따로)+vide(분리)->따로 갈라놓다"}, {en:"divorce",ko:"이혼",tip:"di(따로)+vorce(돌리다)->따로 돌아섬"}, {en:"document",ko:"서류",tip:"docu(가르치다)+ment->기록 문서"}, {en:"dolphin",ko:"돌고래",tip:"dolph(돼지)+in->바다의 돼지(돌고래)"},
      {en:"domestic",ko:"국내의, 가정의",tip:"domes(집)+tic->집안/나라 안의"}, {en:"donate",ko:"기부하다",tip:"don(주다)+ate->대가 없이 주다"}, {en:"doubt",ko:"의심",tip:"d(두개)+oubt->두 마음이 생겨 의심"}, {en:"dozen",ko:"12개",tip:"doz(12)+en->12개짜리 한 묶음"}, {en:"drag",ko:"끌다",tip:"d(당기다)+rag->무겁게 질질 끌다"},
      {en:"drama",ko:"드라마, 연극",tip:"dra(행동)+ma->행동으로 보여주는 극"}, {en:"drug",ko:"약",tip:"dr(마른)+ug->말린 약초에서 유래"}, {en:"due",ko:"예정된, 마감인",tip:"d(빚)+ue->당연히 해야 할 일"}, {en:"dump",ko:"버리다",tip:"d(쿵)+ump->짐을 쿵 하고 버리다"}, {en:"dust",ko:"먼지",tip:"d(더러운)+ust->더러운 가루 먼지"},
      {en:"duty",ko:"의무",tip:"du(지불하다)+ty->당연한 도리"}, {en:"each",ko:"각각의",tip:"e(하나하나)+ach->하나씩 따로따로"}, {en:"earn",ko:"벌다",tip:"e(얻다)+arn->일을 해서 얻다"}, {en:"ease",ko:"편안함",tip:"e(쉬운)+ase->쉽고 편안한 상태"}, {en:"economy",ko:"경제",tip:"eco(집)+nomy(법)->집안 살림 관리"},
      {en:"edge",ko:"가장자리",tip:"e(끝)+dge->날카로운 끝부분"}, {en:"edit",ko:"편집하다",tip:"e(밖으로)+dit(주다)->고쳐 내보냄"}, {en:"educate",ko:"교육하다",tip:"e(밖)+duc(이끌다)->잠재력 이끌기"}, {en:"effect",ko:"효과, 결과",tip:"ef(밖)+fect(만들다)->나타난 결과"}, {en:"effort",ko:"노력",tip:"ef(밖)+fort(힘)->힘을 밖으로 쏟음"},
      {en:"either",ko:"둘 중 하나",tip:"ei(둘)+ther->어느 것이든 하나"}, {en:"elect",ko:"선출하다",tip:"e(밖으로)+lect(뽑다)->골라 뽑다"}, {en:"electric",ko:"전기의",tip:"elec(호박)+tric->마찰전기 유래"}, {en:"element",ko:"요소",tip:"ele(기본)+ment->기본 성분"}, {en:"else",ko:"그 밖의",tip:"el(다른)+se->다른 것, 그 이외"},
      {en:"embarrass",ko:"당황하게 하다",tip:"em(안)+bar(빗장)->빗장에 막힘"}, {en:"emotion",ko:"감정",tip:"e(밖)+motion(움직임)->마음의 움직임"}, {en:"emphasize",ko:"강조하다",tip:"em(안)+phas(보이다)->강하게 보이기"}, {en:"empire",ko:"제국",tip:"em(안)+pire(명령)->명령이 닿는 나라"}, {en:"employ",ko:"고용하다",tip:"em(안)+ploy(쓰다)->안으로 불러 씀"},
      {en:"empty",ko:"비어 있는",tip:"em(비우다)+pty->속이 텅 빈 상태"}, {en:"enemy",ko:"적",tip:"en(반대)+emy(친구)->친구가 아님"}, {en:"engage",ko:"약속하다, 종사하다",tip:"en(안)+gage(담보)->담보를 걸다"}, {en:"engine",ko:"엔진, 기계",tip:"en(안)+gine(만들다)->힘을 만듦"}, {en:"engineer",ko:"기술자",tip:"engine+er(사람)->기계 다루는 사람"},
      {en:"enormous",ko:"거대한",tip:"e(밖)+norm(표준)->표준 밖으로 큰"}, {en:"entertain",ko:"즐겁게 하다",tip:"enter(사이)+tain(잡다)->관심 잡기"}, {en:"entire",ko:"전체의",tip:"en(안)+tire(만지다)->온전한 상태"}, {en:"envelope",ko:"봉투",tip:"en(안)+velop(싸다)->안에 넣고 쌈"}, {en:"equal",ko:"똑같은",tip:"equ(똑같은)+al->모두가 동등한"},
      {en:"escape",ko:"탈출하다",tip:"e(밖)+scape(망토)->망토 벗고 도망"}, {en:"especial",ko:"특별한",tip:"e(강조)+special(특별한)->더욱 특별"}, {en:"essay",ko:"수필, 과제",tip:"es(밖)+say(말하다)->생각 써서 내기"}, {en:"establish",ko:"설립하다",tip:"e(밖)+stabl(세우다)->확고히 세우다"}, {en:"estimate",ko:"추정하다",tip:"esti(가치)+mate->가치 어림잡기"},
      {en:"even",ko:"평평한, ~조차",tip:"e(동일)+ven->수평이 같은"}, {en:"event",ko:"행사, 사건",tip:"e(밖)+vent(오다)->밖으로 터진 일"}, {en:"ever",ko:"언제나, 결코",tip:"e(항상)+ver->어느 때라도"}, {en:"evidence",ko:"증거",tip:"e(밖)+vid(보다)->보이는 확실한 것"}, {en:"evil",ko:"사악한",tip:"e(반대)+vil(삶)->생명에 반하는 악"},
      {en:"exact",ko:"정확한",tip:"ex(밖)+act(행하다)->딱 맞게 행함"}, {en:"except",ko:"~을 제외하고",tip:"ex(밖)+cept(잡다)->밖으로 빼놓다"}, {en:"exchange",ko:"교환하다",tip:"ex(밖)+change(바꾸다)->서로 바꿈"}, {en:"excite",ko:"흥분시키다",tip:"ex(밖)+cite(부르다)->기분 깨우기"}, {en:"excuse",ko:"변명, 용서하다",tip:"ex(밖)+cuse(죄)->죄에서 벗어나다"},
      {en:"exhaust",ko:"지치게 하다",tip:"ex(밖)+haust(끌어내다)->다 씀"}, {en:"exist",ko:"존재하다",tip:"ex(밖)+ist(서다)->밖에 나타나 서다"}, {en:"exit",ko:"출구",tip:"ex(밖)+it(가다)->밖으로 나가는 길"}, {en:"expand",ko:"확장하다",tip:"ex(밖)+pand(펴다)->밖으로 넓게 펴다"}, {en:"expect",ko:"기대하다",tip:"ex(밖)+spect(보다)->밖을 보며 대기"},
      {en:"expense",ko:"비용",tip:"ex(밖)+pense(돈)->밖으로 나가는 돈"}, {en:"experience",ko:"경험",tip:"ex(밖)+perience(시도)->해본 일"}, {en:"experiment",ko:"실험",tip:"ex+peri(시도)+ment->해보고 확인"}, {en:"expert",ko:"전문가",tip:"ex(밖)+pert(시도)->많이 해본 숙련자"}, {en:"explain",ko:"설명하다",tip:"ex(밖)+plain(평평한)->쉽게 펴기"},
      {en:"expose",ko:"노출하다",tip:"ex(밖)+pose(놓다)->밖에 내놓다"}, {en:"express",ko:"표현하다",tip:"ex(밖)+press(누르다)->짜서 보이다"}, {en:"extend",ko:"연장하다",tip:"ex(밖)+tend(뻗다)->밖으로 뻗다"}, {en:"extra",ko:"추가의",tip:"extr(밖)+a->범위 밖의 여분"}, {en:"extreme",ko:"극도의, 극심한",tip:"ex(밖으로)+treme(끝)->가장 끝"},
      {en:"factor",ko:"요인, 요소",tip:"fac(만들다)+tor->결과를 만드는 것"}, {en:"factory",ko:"공장",tip:"fac(만들다)+tory(장소)->공장"}, {en:"faint",ko:"희미한, 기절하다",tip:"feign(가짜)->힘이 가짜라 쓰러짐"}, {en:"fair",ko:"공평한, 박람회",tip:"fa(말하다)+ir->말한 대로 하는 공평"}, {en:"faith",ko:"믿음, 신념",tip:"fai(믿다)+th(명사)->믿음"},
    ]
  },
  {
    id:11, title:"사회의 도시", emoji:"🏙️",
    color:"#60A5FA", dark:"#1d4ed8",
    desc:"중고등 필수 단어 401~600번",
    words:[
      {en:"familiar",ko:"익숙한, 친근한",tip:"famil(가족)+iar->가족 같은"}, {en:"fancy",ko:"화려한, 공상",tip:"fan(보이다)+cy->눈에 띄게 화려한"}, {en:"fantastic",ko:"환상적인",tip:"fan(보이다)+tastic->환상적"}, {en:"fascinate",ko:"매혹시키다",tip:"fascin(매력)+ate->홀리다"}, {en:"fashion",ko:"유행, 방식",tip:"fac(만들다)+ion->모양을 만듦"},
      {en:"fault",ko:"잘못, 결점",tip:"fall(떨어지다)->수준이 떨어진 점"}, {en:"favor",ko:"호의, 찬성",tip:"fav(호의)->좋게 봐주는 것"}, {en:"fear",ko:"두려움, 공포",tip:"per(위험)->위험을 느껴 무서움"}, {en:"feature",ko:"특징, 특집",tip:"feat(만들다)+ure->만들어진 모양"}, {en:"fee",ko:"요금, 수수료",tip:"피(fee)같은 돈을 내다"},
      {en:"feed",ko:"먹이를 주다",tip:"food(음식)의 동사형"}, {en:"fellow",ko:"동료, 녀석",tip:"fel(같이)+low(놓다)->함께 하는 이"}, {en:"female",ko:"여성",tip:"fe(젖)+male(남성)->여성"}, {en:"fence",ko:"울타리",tip:"de(f)fence(방어)->방어용 벽"}, {en:"fever",ko:"열, 열기",tip:"ferve(끓다)->몸이 끓는 열"},
      {en:"few",ko:"거의 없는, 소수의",tip:"pau(적은)->아주 적은 수"}, {en:"figure",ko:"숫자, 인물, 모양",tip:"fig(만들다)+ure->그려진 형태"}, {en:"final",ko:"마지막의, 결승",tip:"fin(끝)+al->끝의"}, {en:"finance",ko:"재정, 금융",tip:"fin(끝내다)+ance->돈으로 마무리"}, {en:"firm",ko:"굳건한, 회사",tip:"firm(견고한)->단단한 조직"},
      {en:"fit",ko:"알맞다, 어울리다",tip:"옷이 핏(fit)하게 맞다"}, {en:"flag",ko:"깃발",tip:"펄럭(flag)이는 깃발"}, {en:"flame",ko:"불꽃, 화염",tip:"flam(불타다)->활활 타는 불"}, {en:"flash",ko:"번쩍임, 섬광",tip:"플래시가 번쩍 터지다"}, {en:"flat",ko:"평평한, 아파트",tip:"plat(넓은)->바닥이 납작한"},
      {en:"flight",ko:"비행, 항공편",tip:"fly(날다)+ght->나는 일"}, {en:"float",ko:"뜨다, 떠다니다",tip:"flow(흐르다)하며 물에 뜨다"}, {en:"flood",ko:"홍수, 범람",tip:"flow(흐르다)가 과해진 것"}, {en:"flow",ko:"흐르다, 흐름",tip:"물이 졸졸 흘러(flow)가다"}, {en:"fog",ko:"안개",tip:"폭(fog) 안개가 끼다"},
      {en:"fold",ko:"접다",tip:"폴더(folder)폰을 접다"}, {en:"folk",ko:"사람들, 민속의",tip:"ple(가득한)+ok->가득 찬 사람들"}, {en:"follow",ko:"따르다, 따라가다",tip:"팔로(follow)워가 따라오다"}, {en:"force",ko:"힘, 강요하다",tip:"포스(force)가 느껴지는 힘"}, {en:"foreign",ko:"외국의, 이질적인",tip:"for(밖의)+eign->문 밖 나라의"},
      {en:"forever",ko:"영원히",tip:"for(동안)+ever(언제나)->영원히"}, {en:"forgive",ko:"용서하다",tip:"for(멀리)+give(주다)->죄를 줘버림"}, {en:"forth",ko:"앞으로, 외부로",tip:"forward(앞으로)의 짧은 형태"}, {en:"fortunate",ko:"운 좋은",tip:"fort(행운)+unate->운 좋은"}, {en:"fortune",ko:"행운, 재산",tip:"fort(행운)+une->운으로 얻은 부"},
      {en:"forward",ko:"앞으로, 전방의",tip:"for(앞)+ward(방향)->앞쪽으로"}, {en:"found",ko:"설립하다, 기초를 두다",tip:"fund(바닥/기초)를 세우다"}, {en:"frame",ko:"틀, 구조",tip:"프레임(frame) 속에 가두다"}, {en:"frankly",ko:"솔직히",tip:"frank(솔직한)+ly->솔직하게"}, {en:"freeze",ko:"얼다, 결빙",tip:"프리저(freezer) 냉동고에 얼리다"},
      {en:"fright",ko:"공포, 두려움",tip:"fear(두려움)와 비슷한 느낌"}, {en:"frog",ko:"개구리",tip:"개굴개굴 프로그(frog)"}, {en:"frustrate",ko:"좌절시키다",tip:"frustra(헛된)->헛되게 만들다"}, {en:"fry",ko:"튀기다, 볶다",tip:"프라이(fry)팬에 볶다"}, {en:"function",ko:"기능, 작동하다",tip:"func(수행)+tion->제 기능을 함"},
      {en:"fund",ko:"자금, 기금",tip:"found(바닥)가 되는 돈"}, {en:"fur",ko:"털, 모피",tip:"퍼(fur) 코트는 털 옷"}, {en:"furniture",ko:"가구",tip:"furn(장식)+iture->배치한 가구"}, {en:"gain",ko:"얻다, 이익",tip:"게인(gain)하다->이득을 얻다"}, {en:"garage",ko:"차고, 정비소",tip:"가라지(garage)에 차를 넣다"},
      {en:"gate",ko:"문, 출입구",tip:"게이트(gate)로 들어가다"}, {en:"gather",ko:"모으다, 모이다",tip:"가득(gather) 모으다"}, {en:"gear",ko:"장비, 기어",tip:"기어(gear) 장비를 맞추다"}, {en:"general",ko:"일반적인, 장군",tip:"gen(탄생)+eral->전부 아우르는"}, {en:"gentle",ko:"부드러운, 점잖은",tip:"gen(태생) 좋은 사람의 매너"},
      {en:"gesture",ko:"몸짓, 제스처",tip:"gest(나르다)+ure->마음을 실은 몸짓"}, {en:"ghost",ko:"유령",tip:"고스트(ghost) 헌터가 잡는 귀신"}, {en:"giant",ko:"거인, 거대한",tip:"자이언트(giant)급 거물"}, {en:"gift",ko:"선물, 재능",tip:"give(주다)+t->준 것"}, {en:"giraffe",ko:"기린",tip:"목이 긴 지라프(giraffe)"},
      {en:"glance",ko:"흘낏 보다",tip:"글랜(glan) 눈으로 슥 보다"}, {en:"glory",ko:"영광",tip:"글로리(glory)한 승리"}, {en:"glove",ko:"장갑",tip:"글러브(glove)를 끼다"}, {en:"glue",ko:"풀, 접착제",tip:"글루(glue)건으로 붙이다"}, {en:"golf",ko:"골프",tip:"골프(golf)를 치다"},
      {en:"gorgeous",ko:"아주 멋진, 화려한",tip:"고저스(gorge)하게 화려한"}, {en:"govern",ko:"통치하다, 다스리다",tip:"govern(ment)정부가 다스림"}, {en:"grab",ko:"움켜쥐다",tip:"그래(grab)! 하고 손으로 잡다"}, {en:"grace",ko:"우아함, 은총",tip:"그레이스(grace)한 드레스"}, {en:"grade",ko:"성적, 등급",tip:"grad(단계)+e->나뉜 단계"},
      {en:"grand",ko:"웅장한, 원대한",tip:"그랜드(grand) 피아노는 크다"}, {en:"grant",ko:"승인하다, 주다",tip:"cred(믿다)->믿고 허락해 주다"}, {en:"graph",ko:"그래프, 도표",tip:"graph(쓰다)->그려진 도표"}, {en:"greet",ko:"인사하다",tip:"그리(greet)운 사람에게 인사"}, {en:"grocery",ko:"식료품",tip:"grocer(상인)+y->식료품 가게"},
      {en:"guarantee",ko:"보장하다, 보증",tip:"war(지키다)->끝까지 책임짐"}, {en:"guard",ko:"보호하다, 경비원",tip:"가드(guard)가 지켜주다"}, {en:"guest",ko:"손님",tip:"게스트(guest)룸의 손님"}, {en:"guide",ko:"안내하다, 가이드",tip:"가이드(guide)가 길을 알랴줌"}, {en:"guilt",ko:"죄책감, 유죄",tip:"길트(guilt) 죄가 길게 남다"},
      {en:"gun",ko:"총",tip:"총(gun)을 쏘다"}, {en:"half",ko:"절반",tip:"하프(half) 타임은 절반 시간"}, {en:"hall",ko:"홀, 복도",tip:"홀(hall)이 넓은 집"}, {en:"handle",ko:"다루다, 손잡이",tip:"hand(손)+le->손으로 하는 것"}, {en:"handsome",ko:"잘생긴",tip:"hand(손)+some->손이 갈 만큼 멋짐"},
      {en:"happen",ko:"일어났다, 발생하다",tip:"hap(운)+pen->우연히 생기다"}, {en:"harm",ko:"해, 손해",tip:"해(harm)를 끼치다"}, {en:"health",ko:"건강",tip:"heal(치료)+th->건강한 상태"}, {en:"hear",ko:"듣다",tip:"ear(귀)로 듣다"}, {en:"heaven",ko:"천국",tip:"hea(해)+ven(번)->해 뜨는 곳"},
      {en:"height",ko:"높이",tip:"high(높은)의 명사형"}, {en:"helicopter",ko:"헬리콥터",tip:"heli(나선)+pter(날개)"}, {en:"hell",ko:"지옥",tip:"해(hell)로운 곳은 지옥"}, {en:"hesitate",ko:"망설이다",tip:"해지(hesi)기 전 망설이다"}, {en:"hide",ko:"숨기다",tip:"하이(hi)! 나 숨었다"},
      {en:"highway",ko:"고속도로",tip:"high(높은)+way(길)"}, {en:"hint",ko:"힌트",tip:"힌트(hint)를 주다"}, {en:"hire",ko:"고용하다",tip:"하이어(hire)->해라! 고용"}, {en:"hole",ko:"구멍",tip:"홀(hole)인원! 구멍"}, {en:"honey",ko:"꿀",tip:"허니(honey)는 달콤해"},
      {en:"honor",ko:"영광",tip:"온(hon)몸으로 받는 영광"}, {en:"hotel",ko:"호텔",tip:"호텔(hotel) 숙박 시설"}, {en:"hug",ko:"껴안다",tip:"허그(hug)하며 안아주기"}, {en:"huge",ko:"거대한",tip:"휴(hu)하게 큰(ge) 것"}, {en:"humor",ko:"유머",tip:"휴머(humor)러스한 농담"},
      {en:"hunger",ko:"배고픔",tip:"hungry(배고픈)의 명사형"}, {en:"hurt",ko:"다치게 하다",tip:"헐트(hurt)->헐! 다쳤어"}, {en:"identity",ko:"정체성",tip:"ID(아이디)는 정체성"}, {en:"ignore",ko:"무시하다",tip:"i(안)+gnore(알다)->모른척"}, {en:"ill",ko:"아픈",tip:"일(ill)나지 못하게 아픈"},
      {en:"illustrate",ko:"설명하다",tip:"illust(그림)+ate(하다)"}, {en:"imagine",ko:"상상하다",tip:"image(이미지)를 그리다"}, {en:"immediate",ko:"즉각적인",tip:"im(부정)+mediate(중간)"}, {en:"impress",ko:"감명주다",tip:"im(안에)+press(누르다)"}, {en:"improve",ko:"향상시키다",tip:"im(안에)+prove(증명)"},
      {en:"include",ko:"포함하다",tip:"in(안에)+clude(닫다)"}, {en:"income",ko:"수입",tip:"in(안)+come(오다)=수입"}, {en:"increase",ko:"증가하다",tip:"in(안)+crease(자라다)"}, {en:"indeed",ko:"정말로",tip:"in(안)+deed(행위)->실제"}, {en:"indicate",ko:"가리키다",tip:"in(안)+dic(말하다)->지적"},
      {en:"individual",ko:"개인의",tip:"in(불)+dividu(나누다)"}, {en:"industry",ko:"산업",tip:"인(in)+더스(dus)트리"}, {en:"influence",ko:"영향",tip:"in(안)+flu(흐르다)->영향"}, {en:"inform",ko:"알리다",tip:"in(안)+form(형태)->정보"}, {en:"injure",ko:"부상입히다",tip:"in(불)+jure(법)->해치다"},
      {en:"innocent",ko:"순진한",tip:"in(부)+noc(해)->무해한"}, {en:"insist",ko:"주장하다",tip:"in(안)+sist(서다)->고집"}, {en:"inspect",ko:"검사하다",tip:"in(안)+spect(보다)->검찰"}, {en:"instance",ko:"예시",tip:"in(안)+stance(서다)->경우"}, {en:"instant",ko:"즉석의",tip:"in(안)+stant(서있다)->곧"},
      {en:"instead",ko:"대신에",tip:"in(안)+stead(장소)->대신"}, {en:"instruct",ko:"지시하다",tip:"in(안)+struct(세우다)"}, {en:"instrument",ko:"기구",tip:"instru(준비)+ment(도구)"}, {en:"insure",ko:"보험에 들다",tip:"in(안)+sure(확실)->보장"}, {en:"intend",ko:"의도하다",tip:"in(안)+tend(뻗다)->의도"},
      {en:"intense",ko:"강렬한",tip:"in(안)+tense(팽팽한)"}, {en:"intent",ko:"의향",tip:"in(안)+tent(뻗다)->의지"}, {en:"interest",ko:"관심",tip:"inter(사이)+est(있다)"}, {en:"internal",ko:"내부의",tip:"inter(안)+nal(형용사형)"}, {en:"interrupt",ko:"방해하다",tip:"inter(사이)+rupt(깨다)"},
      {en:"invent",ko:"발명하다",tip:"in(안)+vent(오다)->발명"}, {en:"invest",ko:"투자하다",tip:"in(안)+vest(옷)->자본"}, {en:"investigate",ko:"조사하다",tip:"in(안)+vestig(흔적)->추적"}, {en:"involve",ko:"포함하다",tip:"in(안)+volve(굴리다)"}, {en:"iron",ko:"철",tip:"아이언(iron)맨은 철의 사람"},
      {en:"island",ko:"섬",tip:"is(물)+land(땅)=섬"}, {en:"item",ko:"항목",tip:"아이템(item) 획득! 품목"}, {en:"jaw",ko:"턱",tip:"죠(jaw)스(상어)의 턱"}, {en:"jeans",ko:"청바지",tip:"진(jean)짜 파란 바지"}, {en:"joke",ko:"농담",tip:"조크(joke)를 던지다"},
      {en:"journey",ko:"여행",tip:"저(jour:날)+ney->하루여정"}, {en:"joy",ko:"기쁨",tip:"조이(joy)풀하게 기뻐해"}, {en:"judge",ko:"판단하다",tip:"jud(법)+ge(말하다)->판단"}, {en:"junior",ko:"하급의",tip:"jun(어린)+ior(비교)"}, {en:"justice",ko:"정의",tip:"just(옳은)+ice(명사형)"},
      {en:"knee",ko:"무릎",tip:"니(knee)가 무릎 꿇어"}, {en:"knock",ko:"두드리다",tip:"낙(knock)낙 문 두드리기"}, {en:"knowledge",ko:"지식",tip:"know(알다)+ledge(상태)"}, {en:"label",ko:"라벨",tip:"라벨(label)을 붙이다"}, {en:"labor",ko:"노동",tip:"레이버(labor)는 힘든 일"},
      {en:"laboratory",ko:"실험실",tip:"labor(일)+atory(장소)"}, {en:"lack",ko:"부족",tip:"내(lack)가 부족해"}, {en:"lamb",ko:"양",tip:"램(lamb)은 어린 양"}, {en:"lamp",ko:"램프",tip:"램프(lamp) 불을 켜다"}, {en:"lane",ko:"차선",tip:"레인(lane)을 지켜라"},
      {en:"language",ko:"언어",tip:"lang(혀)+uage(행위)"}, {en:"laugh",ko:"웃다",tip:"라프(laugh)하게 웃기"}, {en:"law",ko:"법",tip:"로(law)를 지켜라"}, {en:"lawn",ko:"잔디",tip:"론(lawn) 위의 잔디"}, {en:"lawyer",ko:"변호사",tip:"law(법)+yer(사람)"},
      {en:"lay",ko:"놓다",tip:"레이(lay)다운! 눕히다"}, {en:"lead",ko:"이끌다",tip:"리더(leader)가 이끄는 것"}, {en:"leaf",ko:"잎",tip:"리프(leaf)는 나뭇잎"}, {en:"league",ko:"동맹",tip:"리그(league) 오브 레전드"}, {en:"lean",ko:"기대다",tip:"린(lean)하게 몸을 기대"},
      {en:"leap",ko:"도약",tip:"리프(leap) 점프! 도약"}, {en:"leave",ko:"떠나다",tip:"리브(leave)하고 남겨두다"}, {en:"legal",ko:"법률의",tip:"leg(법)+al(형용사형)"}, {en:"lemon",ko:"레몬",tip:"레몬(lemon)은 셔"}, {en:"lend",ko:"빌려주다",tip:"빌려주면 렌드(lend)비 받아"},
      {en:"let",ko:"시키다",tip:"렛(let)잇고! 가게 두어라"}, {en:"level",ko:"수평",tip:"레벨(level)을 맞추다"}, {en:"license",ko:"면허",tip:"허가(licen)받은 증서"}, {en:"lid",ko:"뚜껑",tip:"리드(lid)는 컵 뚜껑"}, {en:"lift",ko:"들어올리다",tip:"리프트(lift) 타고 위로"},
      {en:"limit",ko:"한계",tip:"리미트(limit)를 넘지 마"}, {en:"link",ko:"연결",tip:"링크(link) 걸어 연결해"}, {en:"list",ko:"목록",tip:"리스트(list)에 적다"}, {en:"livingroom",ko:"거실",tip:"living(생활)+room(방)"}, {en:"load",ko:"짐, 싣다",tip:"짐을 도로(road)에 싣다"},
      {en:"loan",ko:"대출, 빌려주다",tip:"돈을 빌려주는 loan(론)"}, {en:"local",ko:"지역의, 현지의",tip:"loc(장소)+al(의)=지역의"}, {en:"locate",ko:"위치를 찾다",tip:"loc(장소)+ate(하다)=위치하다"}, {en:"lock",ko:"잠그다",tip:"열쇠로 잠그는 lock"}, {en:"log",ko:"통나무, 기록",tip:"통나무(log)에 날짜 기록"},
    ]
  },
  {
    id:12, title:"과학의 실험실", emoji:"🔬",
    color:"#60A5FA", dark:"#1d4ed8",
    desc:"중고등 필수 단어 601~800번",
    words:[
      {en:"loose",ko:"느슨한, 헐거운",tip:"줄이 느슨해서 loose"}, {en:"lose",ko:"잃다, 지다",tip:"경기에서 지면 lose"}, {en:"loss",ko:"손실, 분실",tip:"lose의 명사형 loss"}, {en:"lot",ko:"많음, 부지",tip:"a lot of=많은"}, {en:"loud",ko:"소리가 큰",tip:"라우드 스피커는 소리가 커"},
      {en:"machine",ko:"기계",tip:"머신(machine)=기계"}, {en:"magazine",ko:"잡지",tip:"매거진(magazine)=잡지"}, {en:"magic",ko:"마법",tip:"매직(magic)=마법"}, {en:"main",ko:"주요한",tip:"메인(main) 요리는 주요해"}, {en:"maintain",ko:"유지하다",tip:"main(손)+tain(잡다)=유지"},
      {en:"major",ko:"주요한, 전공",tip:"메이저(major) 리그는 중요"}, {en:"male",ko:"남성",tip:"메일(male)=남성"}, {en:"manage",ko:"관리하다, 경영하다",tip:"man(손)+age(하다)=관리하다"}, {en:"manner",ko:"방식, 예의",tip:"매너(manner)=방식, 예의"}, {en:"manufacture",ko:"제조하다",tip:"manu(손)+fact(만들다)=제조"},
      {en:"mark",ko:"표시, 점수",tip:"체크 표시 마크(mark)"}, {en:"marvel",ko:"경이로워하다",tip:"마블(marvel) 영화는 경이로워"}, {en:"mask",ko:"가면, 마스크",tip:"마스크(mask)=가면"}, {en:"mass",ko:"덩어리, 대중",tip:"매스(mass) 미디어=대중"}, {en:"master",ko:"주인, 숙달하다",tip:"마스터(master)=주인"},
      {en:"match",ko:"경기, 성냥",tip:"축구 매치(match)=경기"}, {en:"mate",ko:"친구, 짝",tip:"룸메이트(mate)=방 친구"}, {en:"matter",ko:"문제, 물질",tip:"중요한 문제(matter)"}, {en:"maximum",ko:"최대",tip:"max(가장큰)+imum=최대"}, {en:"maybe",ko:"아마도",tip:"may(~일지 모른다)+be(이다)"},
      {en:"meal",ko:"식사",tip:"밀(meal)=식사"}, {en:"mean",ko:"의미하다, 비열한",tip:"의미(mean)가 뭐니?"}, {en:"measure",ko:"측정하다, 조치",tip:"자로 재는 measure"}, {en:"medical",ko:"의학의",tip:"medic(의사)+al(의)=의학의"}, {en:"medicine",ko:"약, 의학",tip:"먹는 약(medicine)"},
      {en:"melon",ko:"멜론",tip:"멜론(melon) 과일"}, {en:"melt",ko:"녹다",tip:"얼음이 녹는 melt"}, {en:"mental",ko:"정신의",tip:"멘탈(mental) 관리=정신"}, {en:"mention",ko:"언급하다",tip:"말하다(mention)"}, {en:"menu",ko:"메뉴",tip:"식당 메뉴(menu)"},
      {en:"mess",ko:"엉망진창",tip:"방이 엉망(mess)이야"}, {en:"message",ko:"메시지",tip:"메시지(message)를 남겨"}, {en:"metal",ko:"금속",tip:"메탈(metal)=금속"}, {en:"method",ko:"방법",tip:"메소드(method) 연기=방법"}, {en:"microwave",ko:"전자레인지",tip:"micro(작은)+wave(파동)"},
      {en:"military",ko:"군대의",tip:"밀리터리(military)=군대"}, {en:"mill",ko:"방앗간, 공장",tip:"곡물을 가는 mill"}, {en:"minor",ko:"사소한, 미성년자",tip:"마이너(minor)=작은"}, {en:"minute",ko:"분, 아주 작은",tip:"60분(minute)"}, {en:"mirror",ko:"거울",tip:"미러(mirror)=거울"},
      {en:"mission",ko:"임무",tip:"미션(mission)=임무"}, {en:"mix",ko:"섞다",tip:"믹스(mix) 커피=섞다"}, {en:"modern",ko:"현대의",tip:"모던(modern)=현대적"}, {en:"moment",ko:"순간",tip:"중요한 순간(moment)"}, {en:"monitor",ko:"모니터, 감시하다",tip:"모니터(monitor)로 감시"},
      {en:"mood",ko:"기분, 분위기",tip:"오늘 기분(mood) 좋아"}, {en:"moral",ko:"도덕적인",tip:"도덕(moral) 교과서"}, {en:"moreover",ko:"게다가",tip:"more(더)+over(위에)=게다가"}, {en:"motion",ko:"동작, 움직임",tip:"모션(motion)=동작"}, {en:"motor",ko:"모터, 엔진",tip:"모터(motor)=전동기"},
      {en:"mount",ko:"오르다, 산",tip:"mountain(산)에 오르다"}, {en:"mud",ko:"진흙",tip:"머드(mud) 팩=진흙"}, {en:"muscle",ko:"근육",tip:"머슬(muscle) 마니아=근육"}, {en:"museum",ko:"박물관",tip:"뮤지엄(museum)=박물관"}, {en:"mushroom",ko:"버섯",tip:"머쉬룸(mushroom)=버섯"},
      {en:"mystery",ko:"신비, 수수께끼",tip:"미스터리(mystery)=신비"}, {en:"nail",ko:"손톱, 못",tip:"네일(nail) 아트=손톱"}, {en:"narrow",ko:"좁은",tip:"내로(narrow)라하는 좁은 길"}, {en:"native",ko:"원주민의, 타고난",tip:"nat(태어나다)+ive(의)"}, {en:"navy",ko:"해군",tip:"네이비(navy)=해군"},
      {en:"neat",ko:"깔끔한",tip:"정돈이 니트(neat)하게 됨"}, {en:"necessary",ko:"필요한",tip:"필수적인(necessary)"}, {en:"neighbor",ko:"이웃",tip:"옆집 이웃(neighbor)"}, {en:"neither",ko:"어느 쪽도 ~아니다",tip:"ne(부정)+either(둘 중 하나)"}, {en:"nerve",ko:"신경, 용기",tip:"너브(nerve)=신경"},
      {en:"nest",ko:"둥지",tip:"새 둥지(nest)"}, {en:"net",ko:"그물, 망",tip:"네트(net)=그물"}, {en:"noise",ko:"소음",tip:"노이즈(noise)=소음"}, {en:"none",ko:"아무도 ~않다",tip:"no(없다)+one(하나)=없음"}, {en:"noon",ko:"정오, 낮 12시",tip:"정오(noon)"},
      {en:"nor",ko:"~도 또한 아니다",tip:"n(부정)+or(또는)=~도 아님"}, {en:"notice",ko:"알아차리다, 통지",tip:"노티스(notice)=공지"}, {en:"nowadays",ko:"요즘에는",tip:"now(지금)+a(에)+days(날들)"}, {en:"nowhere",ko:"어디에도 없는",tip:"no(없다)+where(어디)"}, {en:"nut",ko:"견과류",tip:"땅콩 같은 넛(nut)"},
      {en:"oak",ko:"오크, 떡갈나무",tip:"오크(oak) 나무 가구"}, {en:"object",ko:"물체, 반대하다",tip:"ob(반대)+ject(던지다)"}, {en:"observe",ko:"관찰하다, 준수하다",tip:"ob(향해)+serve(지키다)"}, {en:"obvious",ko:"명백한",tip:"ob(앞에)+via(길)=뻔함"}, {en:"occasion",ko:"행사, 경우",tip:"oc(향해)+cas(떨어지다)=사건"},
      {en:"occur",ko:"발생하다",tip:"oc(향해)+cur(달리다)=생기다"}, {en:"ocean",ko:"대양, 바다",tip:"오션(ocean) 월드=바다"}, {en:"odd",ko:"이상한, 홀수의",tip:"홀수는 이상해(odd)"}, {en:"offer",ko:"제공하다, 제안",tip:"of(향해)+fer(나르다)=주다"}, {en:"officer",ko:"공무원, 경찰관",tip:"office(사무실)+er(사람)"},
      {en:"once",ko:"한번, 일단 ~하면",tip:"one(하나)+ce(번)=한번"}, {en:"opera",ko:"오페라",tip:"오페라(opera) 공연"}, {en:"operate",ko:"작동하다, 수술하다",tip:"oper(일)+ate(하다)=작동"}, {en:"opinion",ko:"의견",tip:"내 생각(opinion)"}, {en:"oppose",ko:"반대하다",tip:"op(반대)+pose(두다)=반대하다"},
      {en:"order",ko:"주문, 순서",tip:"어디(order) 주문하셨나요?"}, {en:"ordinary",ko:"보통의",tip:"ordin(질서)+ary(형)=정돈된 보통"}, {en:"other",ko:"다른",tip:"어(o)떤 다른(ther) 것"}, {en:"otherwise",ko:"그렇지 않으면",tip:"other(다른)+wise(방식)=다르게"}, {en:"ought",ko:"~해야 한다",tip:"out(밖)에서도 해야 하는 도리"},
      {en:"oven",ko:"오븐",tip:"구워본(oven) 오븐"}, {en:"overall",ko:"전반적인",tip:"over(위에)+all(모두)=전체"}, {en:"own",ko:"자신의",tip:"오(o)직 나(wn)의 것"}, {en:"pack",ko:"짐을 싸다",tip:"팩(pack)에 넣어 싸다"}, {en:"pain",ko:"고통",tip:"폐인(pain)이 될 만큼 고통"},
      {en:"pair",ko:"한 쌍",tip:"폐어(pair) -> 두 개 한 짝"}, {en:"palace",ko:"궁전",tip:"팔레스(palace)는 왕의 집"}, {en:"pan",ko:"팬, 냄비",tip:"프라이팬(pan)"}, {en:"panic",ko:"공포",tip:"패닉(panic) 상태에 빠지다"}, {en:"parade",ko:"행진",tip:"퍼레이드(parade) 구경가자"},
      {en:"paragraph",ko:"단락",tip:"para(옆에)+graph(쓰다)=문단"}, {en:"pardon",ko:"용서하다",tip:"par(완전)+don(주다)=용서"}, {en:"particular",ko:"특정한",tip:"part(부분)+icul(작은)=딱 그쪽"}, {en:"past",ko:"과거",tip:"패스(past)한 지나간 시간"}, {en:"path",ko:"길",tip:"패스(path)가 통하는 작은 길"},
      {en:"patient",ko:"환자, 인내심 있는",tip:"패배를 견디는(patient) 환자"}, {en:"pattern",ko:"무늬, 패턴",tip:"패턴(pattern)이 반복되다"}, {en:"pause",ko:"멈춤",tip:"퍼즈(pause) 버튼을 눌러요"}, {en:"peace",ko:"평화",tip:"피스(peace) 마크는 평화"}, {en:"pear",ko:"배",tip:"피어(pear)나는 배꽃"},
      {en:"pepper",ko:"후추, 고추",tip:"페퍼(pepper)로 매운 맛"}, {en:"per",ko:"~마다",tip:"퍼(per)센트할 때 마다"}, {en:"perfect",ko:"완벽한",tip:"per(완전)+fect(만들다)=완벽"}, {en:"perform",ko:"수행하다",tip:"per(완전)+form(형태)=공연하다"}, {en:"perhaps",ko:"아마도",tip:"per(통해)+haps(우연)=아마도"},
      {en:"period",ko:"기간",tip:"peri(주변)+od(길)=한 주기"}, {en:"person",ko:"사람",tip:"퍼슨(person)은 개인"}, {en:"pet",ko:"애완동물",tip:"펫(pet) 샵의 동물들"}, {en:"photograph",ko:"사진",tip:"photo(빛)+graph(그림)=사진"}, {en:"physical",ko:"신체의",tip:"physic(자연)+al(형)=물리적인"},
      {en:"picnic",ko:"소풍",tip:"픽(pic)하고 닉(nic) 소풍가자"}, {en:"pie",ko:"파이",tip:"애플파이(pie)"}, {en:"piece",ko:"조각",tip:"피스(piece)는 한 조각"}, {en:"pile",ko:"더미",tip:"파일(pile)처럼 쌓인 더미"}, {en:"pin",ko:"핀",tip:"핀(pin)으로 고정해"},
      {en:"pine",ko:"소나무",tip:"파인(pine)애플 모양 솔방울"}, {en:"pipe",ko:"파이프",tip:"파이프(pipe) 관"}, {en:"pitch",ko:"던지다",tip:"피처(pitch)가 공을 던지다"}, {en:"pity",ko:"불쌍히 여김",tip:"피(pity)눈물 나게 불쌍해"}, {en:"plain",ko:"명백한, 평원",tip:"플레인(plain) 요거트는 기본"},
      {en:"plane",ko:"비행기",tip:"플레인(plane) 타고 하늘로"}, {en:"planet",ko:"행성",tip:"plan(떠돌다)+et(작은)=행성"}, {en:"plant",ko:"식물, 심다",tip:"플랜트(plant)를 화분에 심다"}, {en:"plate",ko:"접시",tip:"플레이트(plate)에 담긴 음식"}, {en:"plenty",ko:"풍부한",tip:"플렌티(plenty)는 가득함"},
      {en:"plus",ko:"더하기",tip:"플러스(plus) 친구"}, {en:"pocket",ko:"주머니",tip:"포켓(pocket) 속의 동전"}, {en:"poem",ko:"시",tip:"포엠(poem)을 낭독하다"}, {en:"poet",ko:"시인",tip:"포잇(poet)은 시를 쓰는 사람"}, {en:"poison",ko:"독",tip:"포이즌(poison)은 치명적 독"},
      {en:"pole",ko:"막대기, 극",tip:"노스폴(pole)은 북극"}, {en:"policy",ko:"정책",tip:"폴(pol)리스가 지키는 정책"}, {en:"polite",ko:"공손한",tip:"폴(pol)리 공손하게 인사"}, {en:"politics",ko:"정치",tip:"poli(도시)+tics(학문)=정치"}, {en:"pollute",ko:"오염시키다",tip:"풀(poll)에 오물(ute) 섞여 오염"},
      {en:"pool",ko:"수영장",tip:"풀(pool)장에서 수영"}, {en:"pop",ko:"터지다",tip:"팝(pop)콘이 펑 터짐"}, {en:"popular",ko:"인기 있는",tip:"popul(사람)+ar(형)=대중적인"}, {en:"pork",ko:"돼지고기",tip:"포크(pork) 커틀릿"}, {en:"port",ko:"항구",tip:"에어포트(port)는 공항"},
      {en:"possess",ko:"소유하다",tip:"pos(힘)+sess(앉다)=차지하다"}, {en:"possible",ko:"가능한",tip:"pos(힘)+sible(할수있는)=가능"}, {en:"post",ko:"우편, 기둥",tip:"포스트(post) 박스"}, {en:"pot",ko:"냄비",tip:"팟(pot)에 끓인 찌개"}, {en:"potential",ko:"잠재적인",tip:"poten(힘)+tial(형)=잠재력"},
      {en:"pour",ko:"붓다",tip:"물을 쪼르르 퍼(pour) 붓다"}, {en:"powder",ko:"가루",tip:"파우더(powder)를 뿌려요"}, {en:"practical",ko:"실용적인",tip:"practi(실행)+cal(형)=실용적"}, {en:"practice",ko:"연습",tip:"프랙티스(practice)로 연습"}, {en:"pray",ko:"기도하다",tip:"프레이(pray)하며 빌다"},
      {en:"prefer",ko:"선호하다",tip:"pre(앞)+fer(나르다)=더 좋아함"}, {en:"pregnant",ko:"임신한",tip:"pre(전)+gnant(태어남)=임신"}, {en:"prepare",ko:"준비하다",tip:"pre(앞)+pare(준비)=미리 준비"}, {en:"presence",ko:"존재",tip:"pre(앞)+sence(있다)=눈앞 존재"}, {en:"press",ko:"누르다",tip:"프레스(press) 기계로 누름"},
      {en:"pretend",ko:"~인 척하다",tip:"pre(앞)+tend(뻗다)=~인 척함"}, {en:"prevent",ko:"예방하다",tip:"pre(앞)+vent(오다)=미리 막음"}, {en:"previous",ko:"이전의",tip:"pre(앞)+vi(길)+ous(형)=앞선"}, {en:"price",ko:"가격",tip:"프라이스(price) 태그"}, {en:"principle",ko:"원리, 원칙",tip:"prin(제일)+ciple(잡다)=원칙"},
      {en:"prison",ko:"감옥",tip:"프리즌(prison) 브레이크"}, {en:"privacy",ko:"사생활",tip:"priva(개인)+cy(명)=사생활"}, {en:"private",ko:"사적인",tip:"priv(개인)+ate(형)=개인적인"}, {en:"prize",ko:"상",tip:"프라이즈(prize)를 받다"}, {en:"probable",ko:"유망한",tip:"prob(증명)+able(가능)=그럴듯함"},
      {en:"proceed",ko:"진행하다",tip:"pro(앞)+ceed(가다)=나아가다"}, {en:"process",ko:"과정",tip:"pro(앞)+cess(가다)=절차"}, {en:"produce",ko:"생산하다",tip:"pro(앞)+duce(끌다)=내놓다"}, {en:"profession",ko:"직업",tip:"pro(앞)+fess(말함)=공언한일"}, {en:"profit",ko:"이익",tip:"pro(앞)+fit(만들다)=앞서얻음"},
      {en:"progress",ko:"전진, 진보",tip:"pro(앞)+gress(가다)=진보"}, {en:"promise",ko:"약속",tip:"pro(앞)+mise(보내다)=미리말함"}, {en:"promote",ko:"촉진하다, 승진시키다",tip:"pro(앞으로)+mote(움직이다)=촉진"}, {en:"pronounce",ko:"발음하다, 선언하다",tip:"pro(앞으로)+nounce(발표)=발음"}, {en:"proper",ko:"적절한, 고유의",tip:"prop(자기자신)의 것->적절한"},
      {en:"property",ko:"재산, 특성",tip:"proper(고유의)+ty(것)=재산"}, {en:"propose",ko:"제안하다, 청혼하다",tip:"pro(앞에)+pose(두다)=제안하다"}, {en:"protect",ko:"보호하다",tip:"pro(앞에)+tect(덮다)=보호하다"}, {en:"protest",ko:"항의하다, 주장하다",tip:"pro(앞에서)+test(증언)=항의"}, {en:"proud",ko:"자랑스러운",tip:"프라우드->풀어두다->자랑스레"},
    ]
  },
  {
    id:13, title:"소통의 광장", emoji:"📢",
    color:"#60A5FA", dark:"#1d4ed8",
    desc:"중고등 필수 단어 801~1000번",
    words:[
      {en:"prove",ko:"증명하다, ~로 판명되다",tip:"pro(시험)+ve(하다)=증명하다"}, {en:"provide",ko:"제공하다, 준비하다",tip:"pro(앞을)+vide(보다)=제공하다"}, {en:"pub",ko:"대중 술집",tip:"pub(lic)(공공의) 장소->술집"}, {en:"public",ko:"공공의, 대중의",tip:"publ(사람들)+ic=공공의"}, {en:"pull",ko:"당기다",tip:"풀->풀어서 당기다"},
      {en:"pump",ko:"펌프, 퍼 올리다",tip:"펌프질해서 물을 퍼올림"}, {en:"punch",ko:"주먹으로 치다, 구멍을 뚫다",tip:"주먹 펀치로 뻥 뚫다"}, {en:"punish",ko:"처벌하다",tip:"pun(벌)+ish=처벌하다"}, {en:"purchase",ko:"구매하다, 구입",tip:"pur(위해)+chase(쫓다)=구매"}, {en:"pure",ko:"순수한, 깨끗한",tip:"퓨어->순수하고 깨끗해"},
      {en:"purple",ko:"보라색",tip:"퍼플->보라색"}, {en:"purpose",ko:"목적, 의도",tip:"pur(앞에)+pose(두다)=목적"}, {en:"puzzle",ko:"퍼즐, 당황하게 하다",tip:"퍼즐은 머리를 당황하게 함"}, {en:"quality",ko:"질, 품질, 특성",tip:"qual(어떤)+ity=질, 품질"}, {en:"quarter",ko:"4분의 1, 15분",tip:"quart(4)+er=4분의 1"},
      {en:"quit",ko:"그만두다, 중단하다",tip:"퀴트->끝! 하고 그만두다"}, {en:"quite",ko:"꽤, 아주, 완전히",tip:"콰이트->꽉 차게 아주 꽤"}, {en:"quote",ko:"인용하다, 견적을 내다",tip:"쿼트->코멘트 따서 인용"}, {en:"rail",ko:"철도, 난간",tip:"레일 위에 기차가 달림"}, {en:"rainbow",ko:"무지개",tip:"rain(비)+bow(활)=무지개"},
      {en:"raise",ko:"들어 올리다, 기르다",tip:"레이즈->손을 위로 레이즈!"}, {en:"range",ko:"범위, 산맥, 배열하다",tip:"레인지->사정거리 범위"}, {en:"rapid",ko:"빠른",tip:"래피드->빛의 속도로 빠르게"}, {en:"rare",ko:"드문, 희귀한",tip:"레어템은 구하기 드물다"}, {en:"rat",ko:"쥐",tip:"랫->실험용 쥐"},
      {en:"rate",ko:"비율, 요금, 속도",tip:"rat(계산)+e=비율, 요금"}, {en:"rather",ko:"오히려, 다소",tip:"라더->오히려 낫다"}, {en:"reach",ko:"도달하다, 뻗다",tip:"리치->손을 뻗어 닿다"}, {en:"react",ko:"반응하다, 반작용하다",tip:"re(다시)+act(행동)=반응"}, {en:"real",ko:"실제의, 진짜의",tip:"리얼->진짜 실제의"},
      {en:"reason",ko:"이유, 이성",tip:"reas(생각)+on=이유, 이성"}, {en:"receive",ko:"받다, 수신하다",tip:"re(다시)+ceive(잡다)=받다"}, {en:"recent",ko:"최근의",tip:"리센트->최근 센트(향기)"}, {en:"recipe",ko:"요리법, 비결",tip:"레시피->요리법"}, {en:"recognize",ko:"인식하다, 인정하다",tip:"re(다시)+cogn(알다)=인식"},
      {en:"recommend",ko:"추천하다, 권고하다",tip:"re(다시)+commend(맡기다)=추천"}, {en:"record",ko:"기록하다, 녹음하다",tip:"re(다시)+cord(마음)=기록"}, {en:"recover",ko:"회복하다, 되찾다",tip:"re(다시)+cover(덮다)=회복"}, {en:"reduce",ko:"줄이다, 감소시키다",tip:"re(뒤로)+duce(끌다)=줄이다"}, {en:"refer",ko:"언급하다, 참조하다",tip:"re(다시)+fer(나르다)=언급"},
      {en:"reflect",ko:"반사하다, 반영하다",tip:"re(다시)+flect(굽히다)=반영"}, {en:"refuse",ko:"거절하다, 거부하다",tip:"re(뒤로)+fuse(붓다)=거절"}, {en:"regard",ko:"간주하다, 여기다",tip:"re(다시)+gard(보다)=여기다"}, {en:"region",ko:"지역, 지방, 범위",tip:"reg(지배)+ion=지배 지역"}, {en:"register",ko:"등록하다, 기재하다",tip:"re(뒤에)+gist(가져오다)=등록"},
      {en:"regular",ko:"규칙적인, 정기적인",tip:"regul(규칙)+ar=규칙적인"}, {en:"relax",ko:"휴식을 취하다, 완화하다",tip:"re(다시)+lax(느슨)=휴식"}, {en:"release",ko:"석방하다, 출시하다",tip:"re(다시)+lease(느슨)=석방"}, {en:"relief",ko:"안도, 경감, 구호",tip:"re(다시)+lieve(가볍게)=안도"}, {en:"rely",ko:"의지하다, 신뢰하다",tip:"re(뒤에)+ly(묶다)=의지하다"},
      {en:"remain",ko:"남다, 여전히 ~이다",tip:"re(뒤에)+main(머물다)=남다"}, {en:"remark",ko:"말하다, 주목하다",tip:"re(다시)+mark(표시)=말하다"}, {en:"remind",ko:"상기시키다, 생각나게 하다",tip:"re(다시)+mind(마음)=상기"}, {en:"remove",ko:"제거하다, 옮기다",tip:"re(뒤로)+move(이동)=제거"}, {en:"rent",ko:"임대하다, 빌리다",tip:"렌트카로 차를 빌리다"},
      {en:"repair",ko:"수리하다, 보수하다",tip:"re(다시)+pair(준비)=수리"}, {en:"repeat",ko:"반복하다",tip:"re(다시)+peat(구하다)=반복"}, {en:"replace",ko:"대체하다, 제자리에 놓다",tip:"re(다시)+place(두다)=대체"}, {en:"reply",ko:"대답하다, 응답",tip:"re(다시)+ply(접다)=대답"}, {en:"report",ko:"보고하다, 보도하다",tip:"re(뒤로)+port(나르다)=보고"},
      {en:"represent",ko:"대표하다, 나타내다",tip:"re(다시)+present(제시)=대표"}, {en:"request",ko:"요청하다, 신청하다",tip:"re(강조)+quest(찾다)=요청"}, {en:"require",ko:"요구하다, 필요로 하다",tip:"re(강조)+quire(구하다)=요구"}, {en:"research",ko:"연구하다, 조사하다",tip:"re(다시)+search(찾다)=연구"}, {en:"reserve",ko:"예약하다, 남겨두다",tip:"re(뒤에)+serve(지키다)=예약"},
      {en:"resist",ko:"저항하다, 참다",tip:"re(대항)+sist(서다)=저항"}, {en:"resource",ko:"자원, 재원",tip:"re(다시)+source(근원)=자원"}, {en:"respect",ko:"존경하다, 준수하다",tip:"re(다시)+spect(보다)=존경"}, {en:"respond",ko:"응답하다, 반응하다",tip:"re(다시)+spond(약속)=응답"}, {en:"responsible",ko:"책임 있는, 원인이 되는",tip:"respond(응답)+ible=책임"},
      {en:"rest",ko:"나머지, 휴식",tip:"레스트->휴식 취하고 나머지"}, {en:"result",ko:"결과, 발생하다",tip:"re(뒤에)+sult(도약)=결과"}, {en:"retire",ko:"은퇴하다, 물러나다",tip:"re(뒤로)+tire(당기다)=은퇴"}, {en:"rice",ko:"쌀, 밥",tip:"라이스->밥 먹자"}, {en:"ride",ko:"타다, 타고 가기",tip:"라이딩->자전거 타기"},
      {en:"rise",ko:"오르다, 일어나다",tip:"라이즈->해처럼 오르다"}, {en:"risk",ko:"위험, 모험",tip:"리스크->감수해야 할 위험"}, {en:"rob",ko:"강탈하다, 훔치다",tip:"롭->로빈훗처럼 뺏다"}, {en:"rocket",ko:"로켓, 급상승하다",tip:"로켓처럼 하늘로 슝"}, {en:"role",ko:"역할, 임무",tip:"롤->게임 속 내 역할"},
      {en:"roll",ko:"구르다, 말다",tip:"롤케이크처럼 말다"}, {en:"roof",ko:"지붕",tip:"루프->지붕"}, {en:"root",ko:"뿌리, 근원",tip:"루트->식물의 뿌리"}, {en:"rope",ko:"밧줄, 로프",tip:"로프->밧줄"}, {en:"rough",ko:"거친, 대략의",tip:"러프->표면이 거칠다"},
      {en:"round",ko:"둥근, 순환",tip:"라운드->둥근 원"}, {en:"route",ko:"경로, 노선",tip:"루트->가는 길"}, {en:"row",ko:"열, 노를 젓다",tip:"1열, 2열->열을 맞추다"}, {en:"royal",ko:"왕실의, 당당한",tip:"roy(왕)+al=왕실의"}, {en:"rub",ko:"문지르다, 비비다",tip:"럽->비벼서 닦다"},
      {en:"rude",ko:"무례한, 버릇없는",tip:"루드->너무 무례해"}, {en:"ruin",ko:"망치다",tip:"ruin(루인)되어버린 폐허"}, {en:"rule",ko:"규칙",tip:"룰(rule)을 지켜라"}, {en:"rush",ko:"서두르다",tip:"러쉬(rush) 아워 바쁜 시간"}, {en:"sail",ko:"항해하다",tip:"세일(sail) 보트 타기"},
      {en:"salary",ko:"급여",tip:"sal(소금)+ary(돈)=봉급"}, {en:"sample",ko:"견본",tip:"샘플(sample)을 써보다"}, {en:"satisfy",ko:"만족시키다",tip:"satis(충분)+fy(만들다)"}, {en:"sauce",ko:"소스",tip:"스테이크 소스(sauce)"}, {en:"scale",ko:"규모",tip:"스케일(scale)이 크다"},
      {en:"scare",ko:"겁주다",tip:"스케어(scare)리하게 무섭다"}, {en:"scarf",ko:"스카프",tip:"목에 두르는 스카프(scarf)"}, {en:"scene",ko:"장면",tip:"드라마 명장면 씬(scene)"}, {en:"schedule",ko:"일정",tip:"스케줄(schedule)을 짜다"}, {en:"scratch",ko:"긁다",tip:"손톱으로 스크래치(scratch)"},
      {en:"scream",ko:"비명 지르다",tip:"영화 스크림(scream) 비명"}, {en:"screen",ko:"화면",tip:"TV 스크린(screen) 화면"}, {en:"seal",ko:"봉인하다",tip:"씰(seal)로 편지 봉하기"}, {en:"search",ko:"검색하다",tip:"서치(search) 엔진 검색"}, {en:"seat",ko:"좌석",tip:"카시트(seat)에 앉다"},
      {en:"secret",ko:"비밀",tip:"시크릿(secret) 가든 비밀"}, {en:"secretary",ko:"비서",tip:"secret(비밀)+ary(사람)"}, {en:"section",ko:"구역",tip:"sect(자르다)+ion(것)=구획"}, {en:"secure",ko:"안전한",tip:"se(분리)+cure(걱정)=안전"}, {en:"seed",ko:"씨앗",tip:"땅에 씨드(seed)를 심다"},
      {en:"seek",ko:"찾다",tip:"숨바꼭질 히드앤식(seek)"}, {en:"seem",ko:"~처럼 보이다",tip:"씸(seem)각하게 보이다"}, {en:"select",ko:"선택하다",tip:"se(따로)+lect(모으다)"}, {en:"self",ko:"자신",tip:"셀프(self) 서비스 스스로"}, {en:"senior",ko:"상급자",tip:"시니어(senior) 선배님"},
      {en:"sense",ko:"감각",tip:"식스 센스(sense) 감각"}, {en:"sentence",ko:"문장",tip:"센텐스(sentence)는 긴 문장"}, {en:"separate",ko:"분리하다",tip:"se(따로)+par(준비)=분리"}, {en:"series",ko:"연속",tip:"시리즈(series)로 이어진 것"}, {en:"serious",ko:"심각한",tip:"시리어스(serious)한 분위기"},
      {en:"serve",ko:"제공하다",tip:"서비스를 서브(serve)하다"}, {en:"session",ko:"회의",tip:"sess(앉다)+ion(것)=회합"}, {en:"settle",ko:"정착하다",tip:"셋틀(settle)잡고 살다"}, {en:"several",ko:"몇몇의",tip:"세버럴(several) 개가 있다"}, {en:"sew",ko:"바느질하다",tip:"쏘(sew)잉 머신=재봉틀"},
      {en:"sex",ko:"성별",tip:"섹스(sex)는 성별 구별"}, {en:"shade",ko:"그늘",tip:"셰이드(shade) 그늘막"}, {en:"shadow",ko:"그림자",tip:"섀도우(shadow) 복싱"}, {en:"shake",ko:"흔들다",tip:"밀크 쉐이크(shake) 흔들기"}, {en:"shall",ko:"~할 것이다",tip:"쉘(shall) 위 댄스?"},
      {en:"shame",ko:"부끄러움",tip:"쉐임(shame) 온 유!"}, {en:"shape",ko:"모양",tip:"쉐이프(shape)가 잡히다"}, {en:"share",ko:"공유하다",tip:"쉐어(share) 하우스 공유"}, {en:"sharp",ko:"날카로운",tip:"샤프(sharp) 펜은 뾰족함"}, {en:"shave",ko:"면도하다",tip:"쉐이빙(shave) 폼 면도"},
      {en:"sheep",ko:"양",tip:"쉬이입(sheep) 조용한 양"}, {en:"sheet",ko:"한 장",tip:"종이 한 시트(sheet)"}, {en:"shelf",ko:"선반",tip:"책꽂이 쉘프(shelf)"}, {en:"shell",ko:"껍데기",tip:"씨쉘(shell) 조개 껍데기"}, {en:"shelter",ko:"피난처",tip:"대피소 쉘터(shelter)"},
      {en:"shift",ko:"옮기다",tip:"시프트(shift) 키로 이동"}, {en:"shine",ko:"빛나다",tip:"선샤인(shine) 햇빛"}, {en:"shock",ko:"충격",tip:"쇼크(shock)를 받다"}, {en:"shoot",ko:"쏘다",tip:"슛(shoot)을 쏘다"}, {en:"shore",ko:"해안",tip:"해안가 쇼어(shore) 산책"},
      {en:"shoulder",ko:"어깨",tip:"숄더(shoulder) 백 가방"}, {en:"shout",ko:"소리치다",tip:"샤우팅(shout) 지르다"}, {en:"shower",ko:"소나기",tip:"소나기 샤워(shower)"}, {en:"shut",ko:"닫다",tip:"셔터(shut)를 내리다"}, {en:"sight",ko:"시력",tip:"시야 인사이트(sight)"},
      {en:"sign",ko:"표지",tip:"싸인(sign) 보드 간판"}, {en:"silly",ko:"어리석은",tip:"실리(silly) 없는 바보"}, {en:"silver",ko:"은",tip:"은메달 실버(silver)"}, {en:"similar",ko:"비슷한",tip:"시밀러(similar) 룩"}, {en:"simple",ko:"단순한",tip:"심플(simple)한 디자인"},
      {en:"since",ko:"~이래로",tip:"신스(since) 2000년"}, {en:"single",ko:"하나의",tip:"싱글(single) 맘/대디"}, {en:"sink",ko:"가라앉다",tip:"싱크(sink)대 물 빠지다"}, {en:"site",ko:"장소",tip:"공사 사이트(site) 현장"}, {en:"situate",ko:"위치시키다",tip:"site(장소)+ate(만들다)"},
      {en:"skill",ko:"기술",tip:"게임 스킬(skill) 기술"}, {en:"slave",ko:"노예",tip:"슬레이브(slave)는 노예"}, {en:"slide",ko:"미끄러지다",tip:"슬라이드(slide) 타고 슝"}, {en:"slight",ko:"약간의",tip:"슬라이트(slight)하게 적은"}, {en:"slip",ko:"미끄러지다",tip:"슬립(slip)나서 꽈당"},
      {en:"smart",ko:"똑똑한",tip:"스마트(smart) 폰"}, {en:"smash",ko:"박살내다",tip:"스매시(smash) 강타하다"}, {en:"smoke",ko:"연기",tip:"스모크(smoke) 햄 연기"}, {en:"smooth",ko:"매끄러운",tip:"스무스(smooth)하게 넘어가다"}, {en:"snack",ko:"과자",tip:"맛있는 스낵(snack)"},
      {en:"snake",ko:"뱀",tip:"스네이크(snake) 뱀 조심"}, {en:"snap",ko:"부러뜨리다",tip:"스냅(snap) 사진 찰칵"}, {en:"social",ko:"사회적인",tip:"소셜(social) 네트워크"}, {en:"society",ko:"사회",tip:"소사이어티(society) 단체"}, {en:"soil",ko:"흙",tip:"쏘일(soil)에 씨앗 심기"},
      {en:"soldier",ko:"군인",tip:"솔져(soldier) 전사"}, {en:"solid",ko:"단단한",tip:"고체 솔리드(solid)"}, {en:"solve",ko:"해결하다",tip:"문제 솔브(solve)하기"}, {en:"somewhat",ko:"어느 정도",tip:"some(약간)+what(무엇)"}, {en:"soon",ko:"곧",tip:"곧 올게요 커밍 순(soon)"},
      {en:"sore",ko:"아픈",tip:"상처가 쏘아(sore)서 아파"}, {en:"sort",ko:"종류",tip:"소트(sort) 정렬 분류"}, {en:"soul",ko:"영혼",tip:"소울(soul) 음악의 영혼"}, {en:"sour",ko:"신",tip:"사워(sour) 크림은 시다"}, {en:"source",ko:"근원",tip:"소스(source) 코드는 근본"},
      {en:"spare",ko:"여분의",tip:"스페어(spare) 키 여분"}, {en:"species",ko:"종(생물)",tip:"spec(보다)+ies=보이는 종류"}, {en:"specific",ko:"구체적인",tip:"spec(보다)+ific=분명히 보이는"}, {en:"speech",ko:"연설",tip:"speak(말하다)의 명사형"}, {en:"spell",ko:"철자를 쓰다",tip:"s+pell(말하다)=철자쓰기"},
      {en:"spend",ko:"소비하다",tip:"s+pend(매달다/돈)=돈쓰다"}, {en:"spin",ko:"회전하다",tip:"바퀴가 삔(spin)다=회전"}, {en:"spirit",ko:"정신",tip:"spir(숨)+it=살아있는 정신"}, {en:"spoil",ko:"망치다",tip:"수포(spoil)로 돌아가다=망침"}, {en:"sponsor",ko:"후원자",tip:"spons(약속)+or=돕기로 약속"},
    ]
  },
  {
    id:14, title:"문화의 극장", emoji:"🎭",
    color:"#60A5FA", dark:"#1d4ed8",
    desc:"중고등 필수 단어 1001~1200번",
    words:[
      {en:"spot",ko:"장소, 점",tip:"점이 찍힌 spot(지점)"}, {en:"spray",ko:"뿌리다",tip:"스프레이(spray)로 뿌리기"}, {en:"spread",ko:"퍼뜨리다",tip:"s+pread(뻗다)=퍼뜨리다"}, {en:"spy",ko:"스파이",tip:"s+py(보다)=몰래 보다"}, {en:"square",ko:"정사각형, 광장",tip:"s+quare(넷)=사각형"},
      {en:"stable",ko:"안정된",tip:"sta(서다)+ble=잘 서 있는"}, {en:"stage",ko:"무대",tip:"sta(서다)+ge=서 있는 무대"}, {en:"stairs",ko:"계단",tip:"stair(오르다)+s=계단"}, {en:"stamp",ko:"우표, 도장",tip:"스탬프(stamp) 쾅 찍기"}, {en:"standard",ko:"표준",tip:"stan(서다)+dard(깃발)=기준"},
      {en:"stare",ko:"응시하다",tip:"star(별)을 stare(응시)"}, {en:"state",ko:"상태, 국가",tip:"sta(서다)+te=서 있는 모양"}, {en:"station",ko:"역",tip:"sta(서다)+tion=멈춰 서는 곳"}, {en:"steady",ko:"꾸준한",tip:"stead(장소)+y=한 자리에"}, {en:"steal",ko:"훔치다",tip:"s+teal(몰래)=훔치다"},
      {en:"steam",ko:"증기",tip:"스팀(steam) 뿜는 증기"}, {en:"steel",ko:"강철",tip:"단단한 스틸(steel)"}, {en:"step",ko:"걸음",tip:"스텝(step)을 밟다"}, {en:"stick",ko:"붙이다, 막대",tip:"끈적하게 stick(붙다)"}, {en:"still",ko:"여전히, 가만히",tip:"sta(서다)+ill=가만히 서서"},
      {en:"stir",ko:"휘젓다",tip:"스윽(s)+터(tir)=휘젓다"}, {en:"stock",ko:"재고, 주식",tip:"st(서다)+ock(더미)=쌓인재고"}, {en:"stomach",ko:"위, 복부",tip:"stoma(입)+ach=먹는 배"}, {en:"storm",ko:"폭풍",tip:"스톰(storm)이 몰아침"}, {en:"straight",ko:"똑바른",tip:"strai(팽팽함)+ght=똑바른"},
      {en:"strange",ko:"낯선",tip:"extra(밖)+ange=밖에서 온"}, {en:"strategy",ko:"전략",tip:"strat(군대)+egy=군대 전략"}, {en:"strawberry",ko:"딸기",tip:"straw(짚)+berry(열매)"}, {en:"stream",ko:"시내, 흐름",tip:"s+tream(흐르다)=시내"}, {en:"stress",ko:"압박, 강조",tip:"s+tress(팽팽함)=압박"},
      {en:"stretch",ko:"늘이다",tip:"스트레칭(stretch) 늘리기"}, {en:"strike",ko:"치다, 파업",tip:"스치듯 스트라이크(strike)"}, {en:"string",ko:"줄, 끈",tip:"s+tring(묶다)=끈"}, {en:"structure",ko:"구조",tip:"struct(짓다)+ure=구조물"}, {en:"struggle",ko:"투쟁하다",tip:"st(서다)+rug(밀다)=애쓰다"},
      {en:"studio",ko:"스튜디오",tip:"stud(공부)+io=작업실"}, {en:"stuff",ko:"물건, 채우다",tip:"속을 stuff(채우다)"}, {en:"subject",ko:"주제, 과목",tip:"sub(아래)+ject(던지다)"}, {en:"succeed",ko:"성공하다",tip:"suc(아래)+ceed(가다)=성공"}, {en:"success",ko:"성공",tip:"succeed의 명사형"},
      {en:"such",ko:"그러한",tip:"s+uch(이와 같은)=그러한"}, {en:"sudden",ko:"갑작스러운",tip:"s+udden(가다)=갑자기 오다"}, {en:"suffer",ko:"고통받다",tip:"suf(아래)+fer(운반)=견디다"}, {en:"suggest",ko:"제안하다",tip:"sug(아래)+gest(가져오다)"}, {en:"suit",ko:"정장, 적합하다",tip:"su(따르다)+it=잘 어울림"},
      {en:"sum",ko:"합계",tip:"sum(최고)=전부 합친 것"}, {en:"super",ko:"최고의",tip:"super(위에)=뛰어난"}, {en:"supper",ko:"저녁 식사",tip:"sup(마시다)+per=가벼운식사"}, {en:"supply",ko:"공급하다",tip:"sup(아래)+ply(채우다)=채움"}, {en:"support",ko:"지지하다",tip:"sup(아래)+port(항구/운반)"},
      {en:"suppose",ko:"가정하다",tip:"sup(아래)+pose(두다)=가정"}, {en:"surface",ko:"표면",tip:"sur(위)+face(얼굴)=겉면"}, {en:"surprise",ko:"놀라게 하다",tip:"sur(위)+prise(잡다)=놀람"}, {en:"surround",ko:"둘러싸다",tip:"sur(위)+round(둥글게)"}, {en:"survey",ko:"조사",tip:"sur(위)+vey(보다)=살피다"},
      {en:"survive",ko:"살아남다",tip:"sur(넘어)+vive(살다)=생존"}, {en:"suspect",ko:"의심하다",tip:"sus(아래)+pect(보다)=의심"}, {en:"swallow",ko:"삼키다",tip:"s+wallow(구르다)=삼킴"}, {en:"sweater",ko:"스웨터",tip:"sweat(땀)+er=땀나게 함"}, {en:"sweep",ko:"쓸다",tip:"s+weep(닦다)=빗자루질"},
      {en:"sweet",ko:"달콤한",tip:"s+weet(맛있는)=달콤한"}, {en:"swing",ko:"흔들리다",tip:"스윙(swing) 댄스 흔들기"}, {en:"switch",ko:"바꾸다",tip:"스위치(switch) 켜고 끄기"}, {en:"system",ko:"체계",tip:"sy(함께)+stem(세우다)"}, {en:"tale",ko:"이야기",tip:"tell(말하다)의 명사형"},
      {en:"tank",ko:"탱크, 수조",tip:"담아두는 탱크(tank)"}, {en:"tap",ko:"톡톡 치다",tip:"탭(tap) 댄스 추며 치기"}, {en:"target",ko:"목표",tip:"타겟(target)을 조준"}, {en:"tax",ko:"세금",tip:"탁(tax) 떼어가는 세금"}, {en:"tea",ko:"차",tip:"티(tea) 한 잔의 여유"},
      {en:"tear",ko:"눈물",tip:"눈가(ear)에 맺힌 t(눈물)"}, {en:"technique",ko:"기술",tip:"techni(기술)+que=전문기술"}, {en:"technology",ko:"과학 기술",tip:"techno(기술)+logy(학문)"}, {en:"teenage",ko:"10대의",tip:"teen(10대)+age(나이)"}, {en:"temperature",ko:"온도",tip:"temper(조절)+ature=온도"},
      {en:"tend",ko:"~하는 경향이 있다",tip:"ten(늘이다)+d=기울다"}, {en:"tense",ko:"긴장한",tip:"tens(늘어나다)=팽팽한"}, {en:"term",ko:"기간, 용어",tip:"ter(끝)+m=정해진 기한"}, {en:"terrible",ko:"끔찍한",tip:"terr(떨다)+ible=무서운"}, {en:"text",ko:"글, 본문",tip:"text(짜다)=글자 조직"},
      {en:"theater",ko:"극장",tip:"thea(보다)+ter=보는 곳"}, {en:"then",ko:"그때, 그러고 나서",tip:"그때(then) 그랬지"}, {en:"theory",ko:"이론",tip:"theo(보다)+ry=관찰한 이론"}, {en:"therefore",ko:"그러므로",tip:"there+fore(앞으로)=그래서"}, {en:"thick",ko:"두꺼운",tip:"씩(thick)씩하게 두꺼운"},
      {en:"thief",ko:"도둑",tip:"띠(thie)+프(ef)=슬쩍도둑"}, {en:"thin",ko:"얇은",tip:"띤(thin)하게 얇은"}, {en:"though",ko:"비록 ~일지라도",tip:"도(tho)+우(ugh)=그렇지만"}, {en:"thousand",ko:"천(1000)",tip:"천(thousand)명의 사람"}, {en:"threat",ko:"위협",tip:"thre(밀다)+at=밀어붙여 위협"},
      {en:"throat",ko:"목구멍",tip:"thro(통하다)+at=음식 통로"}, {en:"through",ko:"~을 통하여",tip:"th(넘어)+rough(거친)->뚫고 가다"}, {en:"throw",ko:"던지다",tip:"쓰로우->멀리 던지다"}, {en:"thus",ko:"이와 같이",tip:"th(그것)+us(우리)->이처럼"}, {en:"tide",ko:"조수, 조류",tip:"타이드->파도가 타이다"},
      {en:"tie",ko:"묶다, 넥타이",tip:"넥타이로 목을 묶다"}, {en:"tight",ko:"꽉 끼는, 단단한",tip:"타이트하게 몸에 붙다"}, {en:"till",ko:"~까지",tip:"un(부정)+till(까지)"}, {en:"tin",ko:"주석, 통조림",tip:"틴(철제) 케이스"}, {en:"tiny",ko:"아주 작은",tip:"타이니->작고 귀여운"},
      {en:"tip",ko:"끝, 조언, 팁",tip:"손가락 끝(tip)의 팁"}, {en:"title",ko:"제목, 직함",tip:"책의 이름표(title)"}, {en:"toast",ko:"토스트, 건배",tip:"빵을 굽고 건배하다"}, {en:"toe",ko:"발가락",tip:"토(발가락) 신발"}, {en:"toilet",ko:"화장실",tip:"토일렛->변기통"},
      {en:"tone",ko:"어조, 말투, 음색",tip:"말의 톤을 높이다"}, {en:"tongue",ko:"혀, 언어",tip:"텅(혀)을 날름거리다"}, {en:"tool",ko:"도구, 연장",tip:"툴박스(공구함)"}, {en:"topic",ko:"주제, 화제",tip:"핫 토픽(인기 주제)"}, {en:"total",ko:"합계의, 전체의",tip:"토탈(전체) 금액"},
      {en:"tough",ko:"거친, 힘든",tip:"터프가이(거친 남자)"}, {en:"tour",ko:"여행, 관광",tip:"투어 가이드"}, {en:"toward",ko:"~쪽으로",tip:"to(~로)+ward(방향)"}, {en:"towel",ko:"수건",tip:"타월로 몸을 닦다"}, {en:"tower",ko:"탑, 타워",tip:"남산 타워"},
      {en:"trace",ko:"추적하다, 흔적",tip:"트레이싱(따라 그리기)"}, {en:"trade",ko:"무역, 거래",tip:"트레이드(교환)"}, {en:"tradition",ko:"전통",tip:"trad(전달)+ition(것)"}, {en:"traffic",ko:"교통",tip:"트래픽 잼(교통 체증)"}, {en:"transfer",ko:"옮기다, 갈아타다",tip:"trans(이동)+fer(나르다)"},
      {en:"transport",ko:"운송하다, 수송",tip:"trans(이동)+port(항구)"}, {en:"trap",ko:"함정, 덫",tip:"트랩을 설치하다"}, {en:"tray",ko:"쟁반, 트레이",tip:"급식판(트레이)"}, {en:"treat",ko:"대우하다, 치료하다",tip:"트리트먼트(관리하다)"}, {en:"triangle",ko:"삼각형",tip:"tri(3)+angle(각)"},
      {en:"trick",ko:"속임수, 장난",tip:"마술 트릭(속임수)"}, {en:"trouble",ko:"문제, 곤란",tip:"트러블 메이커"}, {en:"trunk",ko:"줄기, 코, 트렁크",tip:"나무 기둥 or 자동차 뒤"}, {en:"trust",ko:"신뢰하다, 믿음",tip:"트러스트(신뢰) 기업"}, {en:"truth",ko:"진실, 사실",tip:"true(참된)+th(명사)"},
      {en:"tune",ko:"곡조, 조율하다",tip:"오토튠으로 맞추다"}, {en:"twin",ko:"쌍둥이",tip:"트윈스(쌍둥이) 팀"}, {en:"twist",ko:"비틀다, 꼬다",tip:"트위스트 춤"}, {en:"uniform",ko:"제복, 일정한",tip:"uni(하나)+form(형태)"}, {en:"unit",ko:"단위, 구성 요소",tip:"유닛(개별 단위)"},
      {en:"unite",ko:"결합하다, 통합하다",tip:"uni(하나)+ite(만들다)"}, {en:"university",ko:"대학교",tip:"uni(하나)+vers(돌다)"}, {en:"unless",ko:"~하지 않으면",tip:"un(부정)+less(더 적게)"}, {en:"until",ko:"~까지",tip:"un(어디까지)+til(시간)"}, {en:"upon",ko:"~위에, ~하자마자",tip:"up(위)+on(붙어)"},
      {en:"upper",ko:"위쪽의",tip:"up(위)+er(더)"}, {en:"upset",ko:"화난, 뒤엎다",tip:"up(위)+set(두다)->뒤집히다"}, {en:"valley",ko:"계곡, 골짜기",tip:"실리콘 밸리(계곡)"}, {en:"value",ko:"가치",tip:"밸류(가치)를 높이다"}, {en:"van",ko:"승합차, 밴",tip:"밴을 타고 이동하다"},
      {en:"various",ko:"다양한",tip:"vary(다르다)+ous(많은)"}, {en:"vary",ko:"다르다, 바뀌다",tip:"베리(vary)->다르다"}, {en:"vehicle",ko:"차량, 탈것",tip:"베히클->탈것"}, {en:"version",ko:"판, 형태",tip:"최신 버전(version)"}, {en:"victim",ko:"희생자, 피해자",tip:"빅팀->희생된 사람"},
      {en:"view",ko:"시야, 견해",tip:"뷰(전망)가 좋다"}, {en:"villa",ko:"빌라, 저택",tip:"마을 밖 빌라(집)"}, {en:"village",ko:"마을",tip:"빌리지(마을) 사람들"}, {en:"violent",ko:"폭력적인",tip:"바이올런트->폭력"}, {en:"vision",ko:"시력, 전망",tip:"비전(시야)을 가지다"},
      {en:"volume",ko:"부피, 음량",tip:"볼륨을 높여요"}, {en:"volunteer",ko:"자원봉사자",tip:"vol(의지)+unteer(사람)"}, {en:"vote",ko:"투표하다",tip:"보트(표)를 던지다"}, {en:"wage",ko:"임금, 급료",tip:"웨이지(봉급)를 받다"}, {en:"warn",ko:"경고하다",tip:"워닝(warning) 싸인"},
      {en:"waste",ko:"낭비하다, 쓰레기",tip:"웨이스트(쓰레기) 낭비"}, {en:"wave",ko:"파도, 흔들다",tip:"웨이브(파도)를 타다"}, {en:"weak",ko:"약한",tip:"위크->힘이 약한"}, {en:"weapon",ko:"무기",tip:"웨폰(무기) 장착"}, {en:"weigh",ko:"무게를 달다",tip:"웨이트(무게)를 재다"},
      {en:"whale",ko:"고래",tip:"훼일->커다란 고래"}, {en:"wheel",ko:"바퀴, 휠",tip:"휠을 돌리다"}, {en:"whether",ko:"~인지 아닌지",tip:"웨더->날씨가 어떨지..."}, {en:"which",ko:"어느 것, 어느",tip:"위치->어느 위치?"}, {en:"while",ko:"~하는 동안, 잠시",tip:"어 와일(잠시) 동안"},
      {en:"whisper",ko:"속삭이다",tip:"휘스퍼->귓속말"}, {en:"whistle",ko:"휘파람, 호루라기",tip:"휘슬을 불다"}, {en:"whole",ko:"전체의",tip:"홀(전체) 피자"}, {en:"wide",ko:"넓은",tip:"와이드 스크린"}, {en:"wild",ko:"야생의",tip:"와일드한 야생마"},
      {en:"wing",ko:"날개",tip:"윙 치킨(날개)"}, {en:"wipe",ko:"닦다",tip:"와이퍼로 닦다"}, {en:"wire",ko:"철사, 전선",tip:"와이어로 묶다"}, {en:"wise",ko:"현명한",tip:"와이즈한 현명한 선택"}, {en:"within",ko:"~이내에",tip:"with(함께)+in(안)"},
      {en:"without",ko:"~없이",tip:"with(함께)+out(밖)"}, {en:"wonder",ko:"궁금하다, 경이",tip:"원더(궁금) 우먼"}, {en:"wool",ko:"양모, 울",tip:"울 스웨터"}, {en:"worth",ko:"가치 있는",tip:"워스(~할 가치)가 있다"}, {en:"would",ko:"~일 것이다",tip:"will의 추측/과거"},
      {en:"wound",ko:"상처, 부상",tip:"운드->부상 입다"}, {en:"wrap",ko:"싸다, 포장하다",tip:"랩으로 음식을 싸다"}, {en:"yell",ko:"소리치다",tip:"옐(소리)을 지르다"}, {en:"yet",ko:"아직, 그러나",tip:"낫 옛(not yet)"}, {en:"zebra",ko:"얼룩말",tip:"지브라 무늬"},
      {en:"zero",ko:"0, 제로",tip:"제로 칼로리"},
    ]
  },
  {
    id:15, title:"심화 어휘 A", emoji:"📚",
    color:"#F472B6", dark:"#be185d",
    desc:"공통 심화 어휘 1~206번",
    words:[
      {en:"abandon",ko:"버리다",tip:"ab(멀리)+bandon(통제)->버리다"}, {en:"aboard",ko:"탑승하여",tip:"a(위에)+board(판자)->배에 타다"}, {en:"abort",ko:"중단하다",tip:"ab(없애다)+ort(태어나다)->중단"}, {en:"abound",ko:"풍부하다",tip:"ab(강조)+ound(파도)->넘쳐나다"}, {en:"abroad",ko:"해외로",tip:"a(에)+broad(넓은)->해외로"},
      {en:"absent",ko:"결석한",tip:"ab(멀리)+sent(존재)->부재중"}, {en:"absorb",ko:"흡수하다",tip:"ab(강조)+sorb(빨아들이다)"}, {en:"abstract",ko:"추상적인",tip:"abs(멀리)+tract(끌다)->뽑아내다"}, {en:"absurd",ko:"터무니없는",tip:"ab(강조)+surd(귀먹은)->말안됨"}, {en:"abuse",ko:"남용하다, 학대하다",tip:"ab(나쁘게)+use(사용)->남용"},
      {en:"academy",ko:"학원, 학술원",tip:"공부하는 숲에서 유래된 학원"}, {en:"accelerate",ko:"가속하다",tip:"ac(쪽으로)+celer(빠른)->가속"}, {en:"accommodate",ko:"수용하다",tip:"ac(쪽)+com(함께)+mod(맞춤)"}, {en:"accompany",ko:"동행하다",tip:"ac(쪽으로)+company(동료)"}, {en:"accomplish",ko:"성취하다",tip:"ac(쪽)+compl(채우다)->완성"},
      {en:"accord",ko:"일치하다, 합의",tip:"ac(쪽으로)+cord(심장)->일치"}, {en:"accumulate",ko:"축적하다",tip:"ac(쪽으로)+cumul(쌓다)->누적"}, {en:"accurate",ko:"정확한",tip:"ac(쪽)+cur(정성)->정확한"}, {en:"ache",ko:"아프다, 통증",tip:"아! 체(ache)해서 배가 아파"}, {en:"acid",ko:"산성, 신맛의",tip:"ac(날카로운)->톡 쏘는 산성"},
      {en:"acknowledge",ko:"인정하다",tip:"ac(쪽)+knowledge(지식)->인정"}, {en:"acquire",ko:"획득하다",tip:"ac(쪽으로)+quire(구하다)"}, {en:"acquisition",ko:"습득, 인수",tip:"ac(쪽)+quisit(구함)->얻음"}, {en:"addict",ko:"중독자",tip:"ad(쪽으로)+dict(말하다)->빠짐"}, {en:"adequate",ko:"적당한, 충분한",tip:"ad(쪽)+equ(평등)->딱 맞는"},
      {en:"adjust",ko:"조절하다, 맞추다",tip:"ad(쪽으로)+just(올바른)->조정"}, {en:"administer",ko:"관리하다, 집행하다",tip:"ad(쪽)+minister(봉사/관리)"}, {en:"adolescent",ko:"청소년",tip:"ad(쪽)+olesc(자라다)->성장기"}, {en:"adverse",ko:"거스르는, 불리한",tip:"ad(반대)+verse(돌다)->역경"}, {en:"advocate",ko:"옹호하다, 지지자",tip:"ad(쪽으로)+voc(목소리)->지지"},
      {en:"aesthetic",ko:"미적인",tip:"미를 보고 \'에스테틱\' 느끼다"}, {en:"agency",ko:"대리점, 기관",tip:"ag(하다)->대신 일하는 곳"}, {en:"agenda",ko:"의제, 안건",tip:"ag(하다)+enda(것들)->할 일"}, {en:"aggress",ko:"공격하다",tip:"ag(쪽)+gress(가다)->달려들다"}, {en:"agriculture",ko:"농업",tip:"agri(밭)+culture(경작)->농업"},
      {en:"alert",ko:"경계하는, 알람",tip:"al(쪽)+ert(높은)->깨어있기"}, {en:"alien",ko:"외계인, 이질적인",tip:"ali(다른)+en->다른 세상 사람"}, {en:"alike",ko:"비슷한",tip:"a(같이)+like(좋아하는)->닮은"}, {en:"allocate",ko:"할당하다, 배분하다",tip:"al(쪽)+loc(장소)->배치하다"}, {en:"ally",ko:"동맹, 연합하다",tip:"al(쪽)+ly(묶다)->한 팀"},
      {en:"alongside",ko:"~옆에, 나란히",tip:"along(따라)+side(옆)->함께"}, {en:"alternate",ko:"번갈아 하다",tip:"alter(다른)+nate->교대하다"}, {en:"ambassador",ko:"대사, 사절",tip:"amb(주위)+ass(가다)->심부름꾼"}, {en:"ambition",ko:"야망, 포부",tip:"amb(주위)+it(가다)->표 얻기"}, {en:"analyze",ko:"분석하다",tip:"ana(철저히)+lyze(풀다)->분석"},
      {en:"anchor",ko:"닻, 고정시키다",tip:"ank(구부러진)->닻으로 고정"}, {en:"ancient",ko:"고대의",tip:"anci(앞선)->오래전 옛날의"}, {en:"angle",ko:"각도, 모서리",tip:"ang(구부러진)->꺾인 각도"}, {en:"anniversary",ko:"기념일",tip:"anni(해마다)+vers(돌다)"}, {en:"anticipate",ko:"예상하다, 기대하다",tip:"anti(미리)+cip(잡다)->예측"},
      {en:"anxiety",ko:"걱정, 불안",tip:"anx(목조르다)->답답한 걱정"}, {en:"apology",ko:"사과",tip:"apo(멀리)+logy(말)->잘못 시인"}, {en:"apparent",ko:"명백한",tip:"ap(쪽)+par(보이다)->보이는"}, {en:"approve",ko:"승인하다, 찬성하다",tip:"ap(쪽)+prove(증명)->찬성"}, {en:"approximate",ko:"대략의, 가깝다",tip:"ap(쪽)+proxim(가까운)->대략"},
      {en:"architect",ko:"건축가",tip:"archi(으뜸)+tect(짓다)->설계"}, {en:"arise",ko:"발생하다",tip:"a(위로)+rise(오르다)->생기다"}, {en:"arrow",ko:"화살",tip:"날카로운 화살을 애로(arrow)우다"}, {en:"artifice",ko:"기술, 책략",tip:"art(기술)+fice(만들다)->기교"}, {en:"aspect",ko:"측면, 양상",tip:"a(쪽)+spect(보다)->보이는 면"},
      {en:"aspire",ko:"열망하다",tip:"a(쪽)+spire(숨쉬다)->간절함"}, {en:"assault",ko:"폭행하다, 공격",tip:"as(쪽)+sault(뛰다)->달려들기"}, {en:"assemble",ko:"모으다, 조립하다",tip:"as(쪽)+semble(같게)->함께"}, {en:"assert",ko:"주장하다",tip:"as(쪽)+sert(잇다)->단언하다"}, {en:"asset",ko:"자산, 재산",tip:"as(충분)+set(만족)->가진 것"},
      {en:"assure",ko:"확신시키다",tip:"as(쪽)+sure(확실한)->보장"}, {en:"astonish",ko:"놀라게 하다",tip:"as(강조)+ton(천둥)->깜짝"}, {en:"athlete",ko:"운동선수",tip:"athl(경기)+ete->경기하는 이"}, {en:"atom",ko:"원자",tip:"a(부정)+tom(자르다)->더 못 자름"}, {en:"attribute",ko:"~의 탓으로 돌리다",tip:"at(쪽)+tribute(주다)->원인"},
      {en:"auction",ko:"경매",tip:"auc(늘리다)+tion->값 올리기"}, {en:"authentic",ko:"진짜의, 인증된",tip:"auth(스스로)->직접 만든 진짜"}, {en:"author",ko:"작가",tip:"auth(늘리다)+or->창조한 사람"}, {en:"avail",ko:"도움이 되다",tip:"a(쪽)+vail(가치/힘)->유용함"}, {en:"await",ko:"기다리다",tip:"a(강조)+wait(기다리다)->대기"},
      {en:"awe",ko:"경외감",tip:"아!(Ah) 오!(Oh) 놀라운 경외감"}, {en:"ban",ko:"금지하다",tip:"게시판 \'밴(Ban)\' 당하면 금지"}, {en:"bankrupt",ko:"파산한",tip:"bank(은행)+rupt(깨지다)->파산"}, {en:"bargain",ko:"흥정하다, 싸게 산 물건",tip:"bar(막다)+gain(얻다)->깎기"}, {en:"barrier",ko:"장벽, 장애물",tip:"bar(막대기)+rier->가로막는 것"},
      {en:"beam",ko:"빛줄기, 미소",tip:"빛이 비(beam)치다->광선"}, {en:"beard",ko:"턱수염",tip:"비어(beard)있는 턱에 난 수염"}, {en:"beast",ko:"짐승, 야수",tip:"비(Be)+스트(Strong)->야수"}, {en:"behalf",ko:"이익, 대리",tip:"be(곁)+half(반쪽)->누구 편"}, {en:"behave",ko:"행동하다",tip:"be(강조)+have(가지다)->처신"},
      {en:"behaviour)",ko:"행동",tip:"behave의 명사형 (영국식)"}, {en:"betray",ko:"배신하다",tip:"be(강조)+tray(주다)->넘겨주다"}, {en:"bias",ko:"편견, 선입견",tip:"비스(bias)듬히 보다->편견"}, {en:"biography",ko:"전기, 일대기",tip:"bio(생명)+graphy(기록)->인생기록"}, {en:"biology",ko:"생물학",tip:"bio(생명)+logy(학문)->생물학"},
      {en:"blast",ko:"폭발",tip:"불(b)+라스트(last)->펑 폭발"}, {en:"blend",ko:"섞다",tip:"블렌더(blender)로 섞다"}, {en:"blink",ko:"깜빡이다",tip:"블(b)+링크(link)->눈 깜빡"}, {en:"blossom",ko:"꽃, 피다",tip:"불(b)+로섬(awesome)->꽃 멋짐"}, {en:"bold",ko:"대담한, 굵은",tip:"볼(ball)드가 굵은 글씨->대담"},
      {en:"boost",ko:"밀어올리다, 북돋우다",tip:"부(bu)+스트(start)->밀기"}, {en:"border",ko:"국경, 경계",tip:"보드(board)로 나눈 경계선"}, {en:"boundary",ko:"경계, 범위",tip:"bound(묶다)+ary->범위 한계"}, {en:"breed",ko:"번식하다, 품종",tip:"부(b)+리드(read)->키우다"}, {en:"breeze",ko:"산들바람",tip:"부리(bree)+지(ze)->시원한 바람"},
      {en:"broadcast",ko:"방송하다",tip:"broad(넓게)+cast(던지다)=방송"}, {en:"brute",ko:"짐승, 야수",tip:"부르트(brute)튼 짐승의 발"}, {en:"bulk",ko:"대량, 규모",tip:"벌컥(bulk) 벌컥 대량 섭취"}, {en:"bull",ko:"황소",tip:"뿔(bull) 달린 황소"}, {en:"bully",ko:"괴롭히다",tip:"뿔(bull)난 소처럼 괴롭히다"},
      {en:"bundle",ko:"묶음, 보따리",tip:"번들(bundle)거리는 보따리"}, {en:"burden",ko:"짐, 부담",tip:"버든(버티다)+짐=부담"}, {en:"butcher",ko:"정육점 주인, 도살하다",tip:"부처(butcher)님은 고기안해"}, {en:"buzz",ko:"윙윙거리다",tip:"벌이 \'버즈\'하고 윙윙대다"}, {en:"cancel",ko:"취소하다",tip:"can(할수)+cel(취소)=취소"},
      {en:"cancer",ko:"암",tip:"캔(can) 음식 많이 먹으면 암"}, {en:"candidate",ko:"후보자",tip:"캔디(candi)+데이트(date)=후보"}, {en:"canvas",ko:"천, 캔버스",tip:"캔버스 위에 그린 그림"}, {en:"capture",ko:"붙잡다, 포획하다",tip:"캡(cap:머리)을 잡다=포획"}, {en:"carve",ko:"새기다, 조각하다",tip:"칼(car)로 파서(ve) 새기다"},
      {en:"cater",ko:"음식을 공급하다",tip:"케이터(캐오다)+터=음식공급"}, {en:"cattle",ko:"소, 가축",tip:"캐슬(castle)에서 키우는 소"}, {en:"caution",ko:"주의, 경고",tip:"코선(caution) 넘지않게 주의"}, {en:"cave",ko:"동굴",tip:"캐내브(cave)니 나온 동굴"}, {en:"cease",ko:"중단하다",tip:"씨(cease)를 말리다=중단"},
      {en:"celebrate",ko:"축하하다",tip:"셀레브(celebr)+ate(하다)=축하"}, {en:"celebrity",ko:"유명인",tip:"셀럽(celeb)+ity=유명인"}, {en:"censor",ko:"검열하다",tip:"센서(sensor)로 싹 검열하다"}, {en:"certificate",ko:"증명서",tip:"certi(확실)+ficate(하다)=증명서"}, {en:"chamber",ko:"방, 회의실",tip:"침(cham)대 있는 방(ber)"},
      {en:"chaos",ko:"혼돈",tip:"카오스 상태=완전 혼란"}, {en:"charity",ko:"자선, 구호품",tip:"채리티(차리다)+ty=자선상차림"}, {en:"chef",ko:"요리사",tip:"쉐프=전문 요리사"}, {en:"chemical",ko:"화학의",tip:"케미(chemi)+cal=화학의"}, {en:"chill",ko:"냉기, 한기",tip:"칠(chill)흑같은 추위와 냉기"},
      {en:"chin",ko:"턱",tip:"친(chin)절하게 턱 내밀기"}, {en:"choir",ko:"합창단",tip:"콰이어(고이어) 모인 합창단"}, {en:"chorus",ko:"합창",tip:"코러스=다같이 노래함"}, {en:"chronic",ko:"만성적인",tip:"chron(시간)+ic=오래된 만성"}, {en:"circulate",ko:"순환하다, 유포되다",tip:"circul(원)+ate=돌다, 순환"},
      {en:"cite",ko:"인용하다",tip:"사이트(cite)에서 인용하다"}, {en:"clap",ko:"박수치다",tip:"클랩(clap)=손뼉 소리"}, {en:"clash",ko:"충돌하다",tip:"클래시(clash)=쾅 충돌하다"}, {en:"clause",ko:"절, 조항",tip:"클로즈(close)된 문장=절"}, {en:"clay",ko:"점토",tip:"클레이(clay) 점토 놀이"},
      {en:"cling",ko:"매달리다, 달라붙다",tip:"클링(끌림)에 매달리다"}, {en:"clinic",ko:"진료소, 클리닉",tip:"클리닉=전문 병원"}, {en:"cluster",ko:"무리, 송이",tip:"클러스터=뭉쳐있는 무리"}, {en:"coincide",ko:"동시에 일어나다, 일치하다",tip:"co(함께)+incide(발생)=일치"}, {en:"collaborate",ko:"협력하다",tip:"col(함께)+labor(일)=협력"},
      {en:"collapse",ko:"무너지다, 붕괴하다",tip:"col(함께)+lapse(실수)=붕괴"}, {en:"collar",ko:"깃, 칼라",tip:"칼라(collar) 세운 옷깃"}, {en:"colleague",ko:"동료",tip:"col(함께)+league(연맹)=동료"}, {en:"colony",ko:"식민지, 군락",tip:"콜로니=모여 사는 식민지"}, {en:"column",ko:"기둥, 칼럼",tip:"컬럼=세워진 기둥"},
      {en:"combat",ko:"전투, 싸우다",tip:"com(함께)+bat(치다)=전투"}, {en:"commit",ko:"저지르다, 헌신하다",tip:"com(함께)+mit(보내다)=전념"}, {en:"commodity",ko:"상품",tip:"com(함께)+mod(맞추다)=상품"}, {en:"communist",ko:"공산주의자",tip:"commun(공동)+ist=공산주의"}, {en:"companion",ko:"동료, 친구",tip:"com(함께)+pan(빵)=빵친구"},
      {en:"compatible",ko:"양립 가능한, 호환되는",tip:"com(함께)+pat(느끼다)=호환"}, {en:"compel",ko:"강요하다",tip:"com(함께)+pel(밀다)=강요"}, {en:"compensate",ko:"보상하다, 보충하다",tip:"com(함께)+pens(돈)=보상"}, {en:"compete",ko:"경쟁하다",tip:"com(함께)+pete(구하다)=경쟁"}, {en:"compile",ko:"엮다, 편집하다",tip:"com(함께)+pile(쌓다)=편집"},
      {en:"complement",ko:"보충하다, 보완물",tip:"com(함께)+ple(채우다)=보완"}, {en:"component",ko:"구성 요소, 성분",tip:"com(함께)+pon(두다)=구성품"}, {en:"compose",ko:"구성하다, 작곡하다",tip:"com(함께)+pose(두다)=구성"}, {en:"compound",ko:"혼합물, 합성의",tip:"com(함께)+pound(두다)=혼합"}, {en:"comprehend",ko:"이해하다",tip:"com(함께)+prehend(잡다)=이해"},
      {en:"comprise",ko:"구성되다, 차지하다",tip:"com(함께)+prise(잡다)=구성"}, {en:"compromise",ko:"타협하다",tip:"com(함께)+promise(약속)=타협"}, {en:"conceal",ko:"숨기다",tip:"con(완전히)+ceal(덮다)=숨김"}, {en:"conceive",ko:"생각하다, 임신하다",tip:"con(함께)+ceive(잡다)=생각품다"}, {en:"conclude",ko:"결론짓다",tip:"con(함께)+clude(닫다)=결론"},
      {en:"concrete",ko:"구체적인",tip:"con(함께)+crete(자라다)=구체"}, {en:"condemn",ko:"비난하다",tip:"con(강조)+demn(손실)=비난"}, {en:"conduct",ko:"행동, 수행하다",tip:"con(함께)+duct(끌다)=행동"}, {en:"confer",ko:"상의하다, 수여하다",tip:"con(함께)+fer(운반)=상의"}, {en:"confess",ko:"자백하다",tip:"con(완전히)+fess(말)=자백"},
      {en:"confide",ko:"신뢰하다, 털어놓다",tip:"con(함께)+fide(믿다)=신뢰"}, {en:"confine",ko:"국한하다, 가두다",tip:"con(함께)+fine(끝)=가두다"}, {en:"conform",ko:"순응하다, 일치하다",tip:"con(함께)+form(형태)=순응"}, {en:"confront",ko:"직면하다, 맞서다",tip:"con(함께)+front(앞)=맞서다"}, {en:"congress",ko:"국회, 회의",tip:"con(함께)+gress(가다)=회의"},
      {en:"conscience",ko:"양심",tip:"con(함께)+science(알다)=양심"}, {en:"consent",ko:"동의하다",tip:"con(함께)+sent(느끼다)=동의"}, {en:"conserve",ko:"보존하다, 보호하다",tip:"con(함께)+serve(지키다)=보존"}, {en:"consist",ko:"구성되다",tip:"con(함께)+sist(서다)=이뤄지다"}, {en:"constitute",ko:"구성하다",tip:"con(함께)+stitute(세우다)=구성"},
      {en:"constrain",ko:"억제하다, 강요하다",tip:"con(함께)+strain(죄다)=억제"}, {en:"construct",ko:"건설하다",tip:"con(함께)+struct(세우다)=건설"}, {en:"consult",ko:"상담하다",tip:"con(함께)+sult(도약)=상담"}, {en:"contemporary",ko:"현대의, 동시대의",tip:"con(함께)+tempor(시간)=현대"}, {en:"contend",ko:"다투다, 주장하다",tip:"con(함께)+tend(뻗다)=싸우다"},
      {en:"continent",ko:"대륙",tip:"con(함께)+tin(잡다)=대륙"}, {en:"contradict",ko:"모순되다, 반박하다",tip:"contra(반대)+dict(말)=반박"}, {en:"contrary",ko:"반대의",tip:"contra(반대)+ry=반대의"}, {en:"contrast",ko:"대조, 대비",tip:"contra(반대)+st(서다)=대조"}, {en:"controversy",ko:"논란",tip:"contro(반대)+vers(돌다)=논쟁"},
      {en:"convert",ko:"전환하다, 바꾸다",tip:"con(완전히)+vert(돌다)=변환"}, {en:"convey",ko:"전달하다, 나르다",tip:"con(함께)+vey(길)=나르다"}, {en:"convict",ko:"유죄를 선고하다",tip:"con(함께)+vict(이기다)=죄를확정"}, {en:"cooperate",ko:"협력하다",tip:"co(함께)+operate(작동)=협력"}, {en:"coordinate",ko:"조정하다",tip:"co(함께)+ordin(질서)=조정함"},
      {en:"copyright",ko:"저작권",tip:"copy(복사)+right(권리)=저작권"}, {en:"cord",ko:"끈",tip:"끈이나 선"}, {en:"core",ko:"핵심",tip:"사과의 속 부분=핵심"}, {en:"corn",ko:"옥수수",tip:"알곡, 옥수수"}, {en:"corporate",ko:"기업의",tip:"corpor(몸)+ate=단체의,기업의"},
      {en:"correspond",ko:"일치하다",tip:"cor(함께)+respond(응답)=일치"},
    ]
  },
  {
    id:16, title:"심화 어휘 B", emoji:"📖",
    color:"#F472B6", dark:"#be185d",
    desc:"공통 심화 어휘 207~412번",
    words:[
      {en:"corridor",ko:"복도",tip:"달리는(corr) 길=복도"}, {en:"corrupt",ko:"부패한",tip:"cor(함께)+rupt(깨지다)=부패한"}, {en:"costume",ko:"의상",tip:"관습(custom)에서 온 복장"}, {en:"counsel",ko:"상담하다",tip:"coun(함께)+sel(부르다)=상담"}, {en:"counterpart",ko:"상대",tip:"counter(반대)+part(쪽)=상대방"},
      {en:"coupon",ko:"쿠폰",tip:"잘라낸(coup) 조각=쿠폰"}, {en:"courage",ko:"용기",tip:"cour(심장)+age=심장의힘,용기"}, {en:"craft",ko:"공예, 기술",tip:"손으로 만드는 기술"}, {en:"craze",ko:"열광",tip:"미친(crazy) 듯한 열풍"}, {en:"credible",ko:"믿을 수 있는",tip:"cred(믿다)+ible(가능)=신뢰"},
      {en:"creep",ko:"살금살금 걷다",tip:"기어가다, 살금살금걷다"}, {en:"crew",ko:"승무원",tip:"함께 일하는 선원,팀"}, {en:"criterion",ko:"기준",tip:"crit(판단)+erion=판단기준"}, {en:"crop",ko:"농작물",tip:"수확하는 농작물"}, {en:"crucial",ko:"결정적인",tip:"cruc(십자가,교차)=중요한"},
      {en:"cruise",ko:"유람선 여행",tip:"가로질러(cruis) 항해함"}, {en:"crush",ko:"으깨다",tip:"꽉 눌러서 으깨다"}, {en:"crystal",ko:"수정",tip:"맑고 투명한 결정체"}, {en:"cultivate",ko:"경작하다",tip:"cult(경작)+ivate=기르다"}, {en:"currency",ko:"통화, 화폐",tip:"curr(흐르다)+ency=유통화폐"},
      {en:"curriculum",ko:"교육과정",tip:"curr(달리다)+iculum=과정"}, {en:"curry",ko:"카레",tip:"맛있는 카레 요리"}, {en:"curse",ko:"저주",tip:"입으로 내뱉는 저주"}, {en:"curve",ko:"곡선",tip:"휘어진 선"}, {en:"custody",ko:"양육권, 감금",tip:"cust(지키다)+ody=보호,관리"},
      {en:"custom",ko:"관습",tip:"늘 하던 행동=관습"}, {en:"cynical",ko:"냉소적인",tip:"개(cyn)처럼 으르렁거리는"}, {en:"dairy",ko:"낙농의",tip:"우유(daie)가 있는 곳"}, {en:"damp",ko:"축축한",tip:"눅눅하고 축축한"}, {en:"dash",ko:"돌진",tip:"빠르게 내달림"},
      {en:"database",ko:"데이터베이스",tip:"data(자료)+base(기초)"}, {en:"datum",ko:"자료",tip:"data의 단수형=하나의자료"}, {en:"decade",ko:"10년",tip:"dec(10)+ade=10년의기간"}, {en:"decay",ko:"부패하다",tip:"de(아래)+cay(떨어지다)=썩다"}, {en:"decent",ko:"괜찮은, 예의바른",tip:"dec(걸맞다)+ent=적절한"},
      {en:"declare",ko:"선언하다",tip:"de(강조)+clare(맑다)=분명히말함"}, {en:"decline",ko:"거절하다, 감소",tip:"de(아래)+cline(기울다)=감소"}, {en:"decrease",ko:"줄이다",tip:"de(아래)+crease(자라다)=감소"}, {en:"dedicate",ko:"헌신하다",tip:"de(강조)+dic(말하다)=바치다"}, {en:"defeat",ko:"패배시키다",tip:"de(반대)+feat(행동)=쳐부수다"},
      {en:"defend",ko:"방어하다",tip:"de(떨어져)+fend(치다)=막다"}, {en:"deficiency",ko:"부족",tip:"de(부족)+fic(만들다)=결핍"}, {en:"deficit",ko:"적자",tip:"de(부족)+fic(만들다)=모자람"}, {en:"delegate",ko:"대표",tip:"de(보내다)+leg(법,위임)=대표"}, {en:"delete",ko:"삭제하다",tip:"지워서 없애다"},
      {en:"deliberate",ko:"신중한, 의도적인",tip:"de(강조)+liber(저울)=신중"}, {en:"delicate",ko:"섬세한",tip:"de(강조)+lic(유혹)=섬세한"}, {en:"democracy",ko:"민주주의",tip:"demo(사람)+cracy(지배)"}, {en:"democrat",ko:"민주주의자",tip:"demo(사람)+crat(지배자)"}, {en:"demon",ko:"악마",tip:"사악한 귀신, 악마"},
      {en:"dense",ko:"밀집한",tip:"빽빽하게 모여 있는"}, {en:"depict",ko:"묘사하다",tip:"de(강조)+pict(그림)=그리다"}, {en:"deposit",ko:"예금하다",tip:"de(아래)+posit(두다)=맡기다"}, {en:"deprive",ko:"빼앗다",tip:"de(강조)+prive(개인의)=박탈"}, {en:"derive",ko:"끌어내다",tip:"de(아래)+rive(강)=강물처럼오다"},
      {en:"descend",ko:"내려가다",tip:"de(아래)+scend(오르다)=하강"}, {en:"designate",ko:"지정하다",tip:"de(강조)+sign(표시)=지정"}, {en:"despair",ko:"절망",tip:"de(반대)+spair(희망)=절망"}, {en:"destine",ko:"운명짓다",tip:"de(강조)+st(서다)=정해지다"}, {en:"destiny",ko:"운명",tip:"destine(운명짓다)+y=운명"},
      {en:"destruct",ko:"파괴하다",tip:"de(반대)+struct(세우다)=파괴"}, {en:"detach",ko:"떼어내다",tip:"de(반대)+tach(붙이다)=분리"}, {en:"device",ko:"장치",tip:"고안해 낸 물건, 장치"}, {en:"devil",ko:"악마",tip:"사악한 존재, 악마"}, {en:"devise",ko:"고안하다",tip:"머리를 써서 장치를 만들다"},
      {en:"devote",ko:"바치다",tip:"de(강조)+vote(서약)=헌신"}, {en:"diabetes",ko:"당뇨병",tip:"당이 빠져나가는 병"}, {en:"dictate",ko:"받아쓰게 하다",tip:"dict(말하다)+ate=지시하다"}, {en:"differ",ko:"다르다",tip:"dif(멀리)+fer(나르다)=다르다"}, {en:"dignity",ko:"존엄",tip:"dign(가치)+ity=품위,존엄"},
      {en:"dimension",ko:"치수, 차원",tip:"di(따로)+mens(재다)=차원"}, {en:"diminish",ko:"줄어들다",tip:"di(강조)+min(작은)=감소"}, {en:"dine",ko:"식사하다",tip:"저녁 식사를 하다"}, {en:"dip",ko:"살짝 담그다",tip:"액체에 살짝 넣다"}, {en:"diplomat",ko:"외교관",tip:"diplo(둘)+mat(문서)=외교관"},
      {en:"disaster",ko:"재앙",tip:"dis(나쁜)+aster(별)=불운"}, {en:"discourse",ko:"담론, 강연",tip:"dis(따로)+course(달리다)"}, {en:"discriminate",ko:"차별하다",tip:"dis(따로)+crim(구분)=차별"}, {en:"dismiss",ko:"해고하다",tip:"dis(멀리)+miss(보내다)=해고"}, {en:"dispute",ko:"논쟁",tip:"dis(반대)+pute(생각)=말다툼"},
      {en:"disrupt",ko:"방해하다",tip:"dis(따로)+rupt(깨다)=중단"}, {en:"distinct",ko:"뚜렷한",tip:"di(따로)+stinct(찌르다)=구별된"}, {en:"distinguish",ko:"구별하다",tip:"di(따로)+stingu(찌르다)"}, {en:"distort",ko:"왜곡하다",tip:"dis(강조)+tort(비틀다)=왜곡"}, {en:"distract",ko:"산만하게 하다",tip:"dis(멀리)+tract(끌다)"},
      {en:"distribute",ko:"분배하다",tip:"dis(따로)+tribute(주다)=나누다"}, {en:"diverse",ko:"다양한",tip:"di(따로)+verse(돌리다)=다양한"}, {en:"divine",ko:"신성한",tip:"div(신)+ine=신의 신성한"}, {en:"domain",ko:"영역, 분야",tip:"dom(집)+ain(장소)=영역"}, {en:"dominate",ko:"지배하다",tip:"dom(집/주인)+ate=지배하다"},
      {en:"dose",ko:"(약의) 복용량",tip:"dose(주다)->한 번 주는 양"}, {en:"dot",ko:"점",tip:"dot=작은 점"}, {en:"draft",ko:"초고, 초안",tip:"draft(끌다)->생각을 끌어내 쓰기"}, {en:"drain",ko:"배수하다, 물을 빼다",tip:"drain(비우다)=물 빠지는 통로"}, {en:"dread",ko:"두려워하다",tip:"dread(두려움)->드러나게 무서움"},
      {en:"drill",ko:"훈련, 드릴",tip:"drill(뚫다)->반복해서 뚫기"}, {en:"drown",ko:"익사하다",tip:"drown(잠기다)=물에 빠져 죽다"}, {en:"dual",ko:"이중의",tip:"du(둘)+al=두 개의"}, {en:"dull",ko:"지루한, 둔한",tip:"dull(둔한)->재미없고 멍청함"}, {en:"dwell",ko:"거주하다",tip:"dwell(머물다)=살다"},
      {en:"dynamic",ko:"역동적인",tip:"dyn(힘)+amic=역동적인 힘"}, {en:"eager",ko:"열망하는",tip:"eager(날카로운)->간절히 바라는"}, {en:"efficient",ko:"효율적인",tip:"ef(밖)+fic(만들다)=잘 만드는"}, {en:"elaborate",ko:"정교한",tip:"e(밖)+labor(노력)=공들인"}, {en:"electronic",ko:"전자의",tip:"elect(전기)+ronic=전자의"},
      {en:"elegant",ko:"우아한",tip:"e(밖)+leg(고르다)=선택된 우아함"}, {en:"elevate",ko:"올리다",tip:"e(밖)+lev(가볍게)=올리다"}, {en:"eliminate",ko:"제거하다",tip:"e(밖)+limin(문턱)=내보내다"}, {en:"elite",ko:"엘리트, 최우수",tip:"e(밖)+lite(고르다)=선택된 소수"}, {en:"embassy",ko:"대사관",tip:"em(사절)+bass(가다)=사절의 곳"},
      {en:"embrace",ko:"포용하다",tip:"em(안)+brace(팔)=품에 안다"}, {en:"emerge",ko:"나타나다",tip:"e(밖)+merge(잠기다)=나타나다"}, {en:"emergency",ko:"비상 사태",tip:"emerge(나타나다)+ency=돌발상황"}, {en:"emit",ko:"내뿜다",tip:"e(밖)+mit(보내다)=내보내다"}, {en:"emphasis",ko:"강조",tip:"em(안)+phas(보이다)=강하게 보임"},
      {en:"encounter",ko:"마주치다",tip:"en(안)+counter(반대)=우연히 만남"}, {en:"endure",ko:"견디다",tip:"dur(지속)+e=오래 견디다"}, {en:"enhance",ko:"향상시키다",tip:"en(만들다)+hance(높은)=높이다"}, {en:"enterprise",ko:"기업, 사업",tip:"enter(안)+prise(잡다)=사업 착수"}, {en:"enthusiastic",ko:"열광적인",tip:"en(안)+thus(신)=신들린 듯한"},
      {en:"entry",ko:"입장, 참가",tip:"enter(들어가다)+ry=입구"}, {en:"environ",ko:"둘러싸다",tip:"en(안)+viron(원)=둘러싸다"}, {en:"envy",ko:"부러워하다",tip:"en(안)+vy(보다)=노려보며 부러움"}, {en:"equip",ko:"장비를 갖추다",tip:"e(준비)+quip(배)=출항 준비"}, {en:"era",ko:"시대",tip:"era(시간의 단위)=시대"},
      {en:"erase",ko:"지우다",tip:"e(밖)+rase(긁다)=긁어서 지우다"}, {en:"erect",ko:"세우다",tip:"e(밖)+rect(바른)=똑바로 세우다"}, {en:"err",ko:"실수하다",tip:"err(방황하다)=길을 잃어 실수함"}, {en:"essence",ko:"본질",tip:"ess(존재)+ence=핵심적 존재"}, {en:"estate",ko:"재산, 부동산",tip:"e(밖)+state(서다)=세워진 재산"},
      {en:"ethic",ko:"윤리",tip:"eth(성품)+ic=도덕적 성품"}, {en:"ethnic",ko:"민족의",tip:"ethn(사람들)+ic=민족의"}, {en:"evacuate",ko:"대피시키다",tip:"e(밖)+vacu(비우다)=비우고 나가다"}, {en:"evaluate",ko:"평가하다",tip:"e(밖)+val(가치)+uate=가치매기다"}, {en:"evitable",ko:"피할 수 있는",tip:"e(밖)+vit(피하다)+able=피할가능"},
      {en:"evolution",ko:"진화",tip:"e(밖)+volu(구르다)=서서히 진화"}, {en:"evolve",ko:"진화하다",tip:"e(밖)+volv(구르다)=변해나가다"}, {en:"exaggerate",ko:"과장하다",tip:"ex(밖)+agger(쌓다)=더 높게 쌓다"}, {en:"exceed",ko:"초과하다",tip:"ex(밖)+ceed(가다)=넘어서 가다"}, {en:"excel",ko:"능가하다",tip:"ex(밖)+cel(올라가다)=위로 솟다"},
      {en:"excess",ko:"과잉",tip:"ex(밖)+cess(가다)=한계를 넘음"}, {en:"exclude",ko:"제외하다",tip:"ex(밖)+clude(닫다)=문 밖서 닫다"}, {en:"executive",ko:"임원, 실행의",tip:"ex(밖)+ecut(따르다)=끝까지 수행"}, {en:"exhibit",ko:"전시하다",tip:"ex(밖)+hibit(두다)=밖에 두다"}, {en:"exotic",ko:"이국적인",tip:"exo(밖)+tic=외부에서 온"},
      {en:"expertise",ko:"전문 지식",tip:"expert(전문가)+ise=전문성"}, {en:"explicit",ko:"명백한",tip:"ex(밖)+plic(접다)=펼쳐 보여줌"}, {en:"explode",ko:"폭발하다",tip:"ex(밖)+plod(손뼉)=소리치며 터짐"}, {en:"explore",ko:"탐험하다",tip:"ex(밖)+plore(외치다)=찾아 다니다"}, {en:"export",ko:"수출하다",tip:"ex(밖)+port(항구)=항구 밖으로"},
      {en:"extent",ko:"정도, 범위",tip:"ex(밖)+tent(뻗다)=뻗어 나간 길"}, {en:"external",ko:"외부의",tip:"exter(밖)+nal=밖의"}, {en:"extinct",ko:"멸종된",tip:"ex(밖)+stinct(끄다)=불이 꺼진"}, {en:"extract",ko:"추출하다",tip:"ex(밖)+tract(끌다)=끌어내다"}, {en:"extraordinary",ko:"비범한",tip:"extra(넘어)+ordinary(평범)=대단한"},
      {en:"eyebrow",ko:"눈썹",tip:"eye(눈)+brow(언덕)=눈 위 눈썹"}, {en:"fabric",ko:"직물, 구조",tip:"fabr(만들다)+ic=만든 천"}, {en:"facilitate",ko:"촉진하다",tip:"facil(쉬운)+itate=쉽게 만들다"}, {en:"facility",ko:"시설, 편의",tip:"facil(쉬운)+ity=편리한 시설"}, {en:"faculty",ko:"능력, 교수진",tip:"fac(하다)+ulty=수행하는 힘"},
      {en:"fade",ko:"희미해지다",tip:"fade(약해지다)=색이 바래다"}, {en:"false",ko:"가짜의, 틀린",tip:"fall(속이다)+se=거짓의"}, {en:"fame",ko:"명성",tip:"fa(말하다)+me=널리 말해짐"}, {en:"fare",ko:"요금",tip:"fare(가다)=가는 데 드는 돈"}, {en:"fasten",ko:"매다, 고정하다",tip:"fast(단단한)+en=단단하게 함"},
      {en:"fate",ko:"운명",tip:"fa(말하다)+te=신이 말한 운명"}, {en:"federal",ko:"연방의",tip:"feder(조약)+al=조약으로 묶인"}, {en:"ferry",ko:"페리, 배",tip:"fer(옮기다)+ry=실어 나르는 배"}, {en:"fertile",ko:"비옥한",tip:"fer(생산)+tile=잘 낳는"}, {en:"fiction",ko:"소설, 허구",tip:"fict(만들다)+ion=지어낸 이야기"},
      {en:"fierce",ko:"격렬한, 사나운",tip:"fierce(야생의)=무섭게 사나운"}, {en:"filter",ko:"필터, 거르다",tip:"filt(펠트)+er=천으로 거르다"}, {en:"finite",ko:"한정된",tip:"fin(끝)+ite=끝이 있는"}, {en:"flaw",ko:"결점",tip:"flaw(틈새)=금 간 틈새/결점"}, {en:"flee",ko:"달아나다",tip:"flee(날다/흐르다)=빨리 도망가다"},
      {en:"flesh",ko:"살, 고기",tip:"flesh(고기)=뼈 위의 살점"}, {en:"flexible",ko:"유연한",tip:"flex(구부리다)+ible=잘 굽는"}, {en:"flip",ko:"홱 뒤집다",tip:"flip(가볍게 치다)=뒤집기"}, {en:"flock",ko:"떼, 무리",tip:"flock(털/무리)=양 떼처럼 모임"}, {en:"flourish",ko:"번창하다",tip:"flour(꽃)+ish=꽃피듯 번성하다"},
      {en:"flush",ko:"붉어지다",tip:"flush(흐르다)=피가 확 쏠림"}, {en:"fond",ko:"좋아하는",tip:"fond(어리석은)->좋아해 바보됨"}, {en:"forbid",ko:"금지하다",tip:"for(멀리)+bid(말하다)=금지하다"}, {en:"forecast",ko:"예보하다",tip:"fore(미리)+cast(던지다)=예보"}, {en:"forehead",ko:"이마",tip:"fore(앞)+head(머리)=이마"},
      {en:"format",ko:"형식",tip:"form(형태)+at=구성 방식"}, {en:"former",ko:"이전의",tip:"form(앞선)+er=이전의 것"}, {en:"formula",ko:"공식",tip:"form(형태)+ula(작은)=공식"}, {en:"foster",ko:"육성하다",tip:"food(먹이다)에서 유래->키우다"}, {en:"fountain",ko:"분수",tip:"fount(샘)처럼 솟구침"},
      {en:"fraction",ko:"부분",tip:"fract(깨다)->부서진 조각"}, {en:"framework",ko:"틀",tip:"frame(뼈대)+work(일)=기본틀"}, {en:"frequent",ko:"빈번한",tip:"frequ(채우다)->자주 발생하는"}, {en:"frost",ko:"서리",tip:"freez(얼다)의 명사형"}, {en:"frown",ko:"눈살을 찌푸리다",tip:"얼굴을 푸룬(frown)거리다"},
      {en:"fuel",ko:"연료",tip:"불(fire)을 때게 하는 것"}, {en:"fulfil",ko:"완수하다",tip:"full(가득)+fill(채우다)=달성"}, {en:"fundamental",ko:"근본적인",tip:"fund(기초)+mental=기초적인"}, {en:"funeral",ko:"장례식",tip:"fun(재미)은 없지만 슬픈 의식"}, {en:"furnish",ko:"공급하다",tip:"furn(비품)+ish(동사)=갖추다"},
      {en:"furthermore",ko:"더욱이",tip:"further(더)+more(더)=게다가"}, {en:"fury",ko:"격분",tip:"불(fire)처럼 화난 상태"}, {en:"fuse",ko:"융합하다",tip:"fus(붓다)->부어서 섞다"}, {en:"gallery",ko:"미술관",tip:"galla(즐거운)+ery=화랑"}, {en:"gamble",ko:"도박하다",tip:"game(놀이)에서 파생된 도박"},
      {en:"gang",ko:"무리",tip:"함께 가(go)는 패거리"},
    ]
  },
  {
    id:17, title:"심화 어휘 C", emoji:"🎓",
    color:"#F472B6", dark:"#be185d",
    desc:"공통 심화 어휘 413~618번",
    words:[
      {en:"gap",ko:"격차",tip:"개(ga)방된 틈(p)"}, {en:"gasoline",ko:"휘발유",tip:"gas(기체)+ol(오일)=기름"}, {en:"gaze",ko:"응시하다",tip:"게이(gaze)즈로 뚫어지게 봄"}, {en:"gender",ko:"성별",tip:"gen(종류)에서 온 성별"}, {en:"gene",ko:"유전자",tip:"gen(태생)의 기본 단위"},
      {en:"generate",ko:"발생시키다",tip:"gen(나다)+ate(만들다)=생성"}, {en:"generous",ko:"관대한",tip:"gen(가문)+erous(좋은 혈통)"}, {en:"genius",ko:"천재",tip:"gen(타고난)+ius(사람)=천재"}, {en:"genuine",ko:"진짜의",tip:"gen(태어난)+uine(본래의)"}, {en:"geography",ko:"지리학",tip:"geo(땅)+graphy(기록)=지리"},
      {en:"geology",ko:"지질학",tip:"geo(땅)+logy(학문)=지질학"}, {en:"glare",ko:"노려보다",tip:"glass(유리)처럼 번쩍 쏘다"}, {en:"globe",ko:"지구본",tip:"glob(둥근 덩어리)=지구"}, {en:"glow",ko:"빛나다",tip:"글로(glow) 빛을 발하다"}, {en:"goat",ko:"염소",tip:"고(go)집 센 트(t) 염소"},
      {en:"graduate",ko:"졸업하다",tip:"gradu(단계)+ate=학위 따다"}, {en:"grain",ko:"곡물",tip:"gran(낟알)=곡식"}, {en:"grasp",ko:"움켜쥐다",tip:"그래(gra)서 스(s)팍(p) 잡다"}, {en:"grateful",ko:"감사하는",tip:"grate(즐거운)+ful(가득)=감사"}, {en:"grave",ko:"무덤",tip:"그레이(grave)브에 묻다"},
      {en:"greed",ko:"탐욕",tip:"그리(gre)디하게 다 먹음"}, {en:"grief",ko:"슬픔",tip:"grav(무거운) 마음의 슬픔"}, {en:"grip",ko:"꽉 잡다",tip:"그립(grip)감이 좋게 꽉 쥐다"}, {en:"gross",ko:"총계의",tip:"그로(gro)스-다 합쳐서 크다"}, {en:"guardian",ko:"보호자",tip:"guard(지키다)+ian(사람)"},
      {en:"guideline",ko:"지침",tip:"guide(안내)+line(선)=지침"}, {en:"gulf",ko:"만",tip:"크게 걸(gul)프 파인 바다"}, {en:"gymnasium",ko:"체육관",tip:"짐(gym) 싸서 운동 가다"}, {en:"habitat",ko:"서식지",tip:"habit(살다)+at(장소)=서식지"}, {en:"halt",ko:"멈추다",tip:"홀(hal)트! 정지해!"},
      {en:"hammer",ko:"망치",tip:"해머(hammer)로 못 박다"}, {en:"handicap",ko:"장애",tip:"hand(손)+in+cap(모자)=불리함"}, {en:"harbor",ko:"항구",tip:"harb(피난처)+or=배의 쉼터"}, {en:"harmony",ko:"조화",tip:"harm(맞추다)+ony=조화"}, {en:"harsh",ko:"가혹한",tip:"하(har)게 쉬(sh)지 못함"},
      {en:"harvest",ko:"수확",tip:"harv(자르다)+est=수확하기"}, {en:"haunt",ko:"나타나다",tip:"혼(haunt)이 나타나 배회함"}, {en:"hazard",ko:"위험",tip:"하(ha)다가 자(za)빠지면 위험"}, {en:"headquarters",ko:"본부",tip:"head(머리)+quarters(장소)"}, {en:"heal",ko:"치료하다",tip:"힐(heal)링하며 낫게 하다"},
      {en:"heel",ko:"뒤꿈치",tip:"하이힐(heel)의 굽 위치"}, {en:"heir",ko:"상속인",tip:"에어(heir)-공기처럼 물려받음"}, {en:"hence",ko:"그러므로",tip:"현(hen)재 상(ce)황으로 보아"}, {en:"heritage",ko:"유산",tip:"herit(상속)+age=문화 유산"}, {en:"hierarchy",ko:"계급",tip:"hier(성스러운)+archy(지배)"},
      {en:"highlight",ko:"강조하다",tip:"high(높은)+light(빛)=강조"}, {en:"holy",ko:"신성한",tip:"홀(hol)리하게 기도함"}, {en:"hook",ko:"갈고리",tip:"훅(hook) 하고 낚다"}, {en:"horizon",ko:"지평선",tip:"horiz(경계)+on(선)=지평선"}, {en:"horror",ko:"공포",tip:"호러(horror) 영화의 공포"},
      {en:"host",ko:"주인",tip:"호스트(host)가 손님 맞음"}, {en:"hostile",ko:"적대적인",tip:"host(손님)+ile(치기)=적대"}, {en:"household",ko:"가구",tip:"house(집)+hold(유지)=한 집"}, {en:"hut",ko:"오두막",tip:"헛(hut)간 같은 작은 집"}, {en:"hypothesis",ko:"가설",tip:"hypo(아래)+thesis(주장)=가설"},
      {en:"ideal",ko:"이상적인",tip:"idea(생각)+al=꿈꾸는 상태"}, {en:"identical",ko:"동일한",tip:"identi(동일한)+cal=똑같은"}, {en:"ideology",ko:"이념",tip:"idea(생각)+logy(학문)=이념"}, {en:"illude",ko:"속이다",tip:"il(안)+lude(놀다)=홀리다"}, {en:"imitate",ko:"모방하다",tip:"imi(비슷한)+ate(만들다)=모방"},
      {en:"immense",ko:"거대한",tip:"im(부정)+mense(측정)=거대함"}, {en:"immigrate",ko:"이민 오다",tip:"im(안으로)+migrate(이동)"}, {en:"immune",ko:"면역의",tip:"im(아닌)+mune(의무)=면제"}, {en:"impact",ko:"영향",tip:"im(안)+pact(박다)=충격"}, {en:"imperial",ko:"제국의",tip:"imper(지휘)+ial=황제의"},
      {en:"implement",ko:"실행하다",tip:"im(안)+ple(채우다)=도구"}, {en:"imply",ko:"암시하다",tip:"im(안으로)+ply(접다)=함축"}, {en:"import",ko:"수입하다",tip:"im(안으로)+port(항구)=수입"}, {en:"impose",ko:"부과하다",tip:"im(위)+pose(두다)=부과"}, {en:"incentive",ko:"격려",tip:"in(안)+cent(노래/불)=보상"},
      {en:"incident",ko:"사건",tip:"in(위)+cid(떨어지다)=우연"}, {en:"incline",ko:"기울다",tip:"in(안)+cline(기울다)=경사"}, {en:"incorporate",ko:"통합하다",tip:"in(안)+corpor(몸)=포함"}, {en:"index",ko:"지표",tip:"in(안)+dex(가리키다)=색인"}, {en:"induce",ko:"유도하다",tip:"in(안)+duce(이끌다)=유도"},
      {en:"infant",ko:"유아, 젖먹이",tip:"in(안)+fari(말)=말 못하는 아기"}, {en:"infect",ko:"감염시키다",tip:"in(안)+fect(만들다)=독을 넣다"}, {en:"infer",ko:"추론하다",tip:"in(안)+fer(나르다)=의미를 끌어내다"}, {en:"inflate",ko:"부풀리다",tip:"in(안)+flate(불다)=공기 넣기"}, {en:"ingredient",ko:"재료, 성분",tip:"in(안)+gredi(가다)=들어가는 것"},
      {en:"inhabit",ko:"거주하다",tip:"in(안)+habit(살다)=안에 살다"}, {en:"inherent",ko:"타고난, 내재된",tip:"in(안)+her(붙다)=본래 붙어있는"}, {en:"inhibit",ko:"억제하다",tip:"in(안)+hibit(잡다)=못하게 잡다"}, {en:"initial",ko:"처음의, 초기의",tip:"in(안)+it(가다)=막 들어선 단계"}, {en:"inject",ko:"주입하다",tip:"in(안)+ject(던지다)=안에 쏘다"},
      {en:"inn",ko:"여관, 숙소",tip:"in(안)=안에서 쉬어가는 곳"}, {en:"innovate",ko:"혁신하다",tip:"in(안)+nov(새로운)=새롭게 바꿈"}, {en:"input",ko:"입력",tip:"in(안)+put(놓다)=안에 넣기"}, {en:"inquire",ko:"묻다, 조사하다",tip:"in(안)+quire(찾다)=안을 묻다"}, {en:"insect",ko:"곤충",tip:"in(안)+sect(자르다)=잘린 마디"},
      {en:"insert",ko:"삽입하다",tip:"in(안)+sert(연결)=끼워 넣다"}, {en:"insight",ko:"통찰력",tip:"in(안)+sight(봄)=속을 꿰뚫어 봄"}, {en:"inspire",ko:"영감을 주다",tip:"in(안)+spire(숨)=숨을 불어넣다"}, {en:"install",ko:"설치하다",tip:"in(안)+stall(자리)=자리에 놓다"}, {en:"instinct",ko:"본능",tip:"in(안)+stinct(찌르다)=찌르는 힘"},
      {en:"institute",ko:"협회, 도입하다",tip:"in(안)+stitute(세우다)=세우다"}, {en:"insult",ko:"모욕하다",tip:"in(안)+sult(뛰다)=남 위에 뛰다"}, {en:"integrate",ko:"통합하다",tip:"in(안)+teg(온전한)=하나로 합침"}, {en:"intellect",ko:"지성",tip:"inter(사이)+lect(고르다)=지혜"}, {en:"intelligent",ko:"똑똑한",tip:"inter(사이)+lig(고르다)=영리한"},
      {en:"interfere",ko:"방해하다",tip:"inter(사이)+fere(치다)=끼어침"}, {en:"interior",ko:"내부의",tip:"inter(안)+ior(더)=더 안쪽의"}, {en:"intermediate",ko:"중간의",tip:"inter(사이)+medi(중간)=중간의"}, {en:"interpret",ko:"해석하다",tip:"inter(사이)+pret(값)=뜻 매기기"}, {en:"interval",ko:"간격",tip:"inter(사이)+vall(벽)=벽 사이"},
      {en:"intervene",ko:"개입하다",tip:"inter(사이)+vene(오다)=끼어듦"}, {en:"intimate",ko:"친밀한",tip:"intimus(가장 안)=속마음 나누는"}, {en:"intrigue",ko:"흥미를 끌다",tip:"in(안)+trig(복잡)=궁금하게 함"}, {en:"invade",ko:"침입하다",tip:"in(안)+vade(가다)=쳐들어가다"}, {en:"irony",ko:"반어법, 아이러니",tip:"말과 실제가 반대인 상황"},
      {en:"irritate",ko:"짜증나게 하다",tip:"irr(자극)+itate=화나게 자극함"}, {en:"isolate",ko:"고립시키다",tip:"isola(섬)+ate=섬처럼 격리함"}, {en:"jail",ko:"교도소",tip:"감옥에 가둘(jail)거야"}, {en:"jar",ko:"항아리, 단지",tip:"잼(jam)을 담는 병(jar)"}, {en:"jog",ko:"조깅하다",tip:"툭툭 치며 가볍게 달리기"},
      {en:"joint",ko:"관절, 공동의",tip:"join(연결)+t=이음매"}, {en:"journal",ko:"일기, 잡지",tip:"jour(날)+nal=매일 적는 기록"}, {en:"jury",ko:"배심원",tip:"jur(법)+y=법을 판단하는 사람"}, {en:"keen",ko:"열렬한, 예리한",tip:"킨(keen) 사이다처럼 톡 쏨"}, {en:"kit",ko:"도구 세트",tip:"키트(kit) 하나면 조립 끝"},
      {en:"knight",ko:"기사",tip:"나이트(night)에 싸우는 기사"}, {en:"knot",ko:"매듭",tip:"낫(not)으로 안 풀리는 매듭"}, {en:"ladder",ko:"사다리",tip:"내(la) 몸 더(dder) 높이"}, {en:"landscape",ko:"풍경",tip:"land(땅)+scape(경치)=경치"}, {en:"lap",ko:"무릎",tip:"앉을 때 생기는 평평한 부분"},
      {en:"latter",ko:"후자의",tip:"lat(늦은)+ter(더)=나중에 온"}, {en:"launch",ko:"출시하다, 발사하다",tip:"새 차 런칭(launch) 행사"}, {en:"laundry",ko:"세탁물",tip:"런(run)해서 세탁소 드라이(dry)"}, {en:"leak",ko:"새다",tip:"리(leak)얼하게 물이 샘"}, {en:"lease",ko:"임대하다",tip:"리(lease)스해서 빌려 쓰기"},
      {en:"leather",ko:"가죽",tip:"내(le) 더(ther) 부드러운 가죽"}, {en:"lecture",ko:"강의",tip:"lect(읽다)+ure=책 읽어주기"}, {en:"legend",ko:"전설",tip:"leg(읽다)+end=전해지는 글"}, {en:"legislate",ko:"법률을 제정하다",tip:"leg(법)+isl+ate(하다)=법 만듦"}, {en:"legitimate",ko:"정당한, 합법적인",tip:"leg(법)+it+imate=법에 맞는"},
      {en:"leisure",ko:"여가",tip:"자유롭게 리(le)얼 쉬어(sure)"}, {en:"liberal",ko:"자유로운, 진보적인",tip:"liber(자유)+al=자유로운"}, {en:"liberty",ko:"자유",tip:"liber(자유)+ty=해방된 상태"}, {en:"likewise",ko:"마찬가지로",tip:"like(같은)+wise(방법)=동일함"}, {en:"linguistic",ko:"언어의",tip:"lingu(혀)+istic=혀(말)에 관한"},
      {en:"liquid",ko:"액체",tip:"리(li)얼 퀴(qui)드하게 흐름"}, {en:"literature",ko:"문학",tip:"liter(글자)+ature=글로 된 예술"}, {en:"logic",ko:"논리",tip:"log(말)+ic=말의 이치"}, {en:"lone",ko:"혼자의",tip:"al(완전)+one(하나)=홀로"}, {en:"loyal",ko:"충성스러운",tip:"loy(법)+al=법과 왕을 지키는"},
      {en:"lump",ko:"덩어리",tip:"럼(lump)프 고기 덩어리"}, {en:"luxury",ko:"사치",tip:"lux(빛)+ury=번쩍이는 비싼 것"}, {en:"magnet",ko:"자석",tip:"마그네슘처럼 자석(magnet)"}, {en:"magnificent",ko:"장엄한",tip:"magni(큰)+fic(만들다)=거대한"}, {en:"manifest",ko:"나타내다, 명백한",tip:"mani(손)+fest(잡다)=명확함"},
      {en:"manipulate",ko:"조작하다",tip:"mani(손)+pul(채우다)=손쓰기"}, {en:"margin",ko:"여백, 차이",tip:"마(mar)지막 긴(gin) 끝"}, {en:"marine",ko:"바다의",tip:"mar(바다)+ine=바다 관련"}, {en:"mature",ko:"성숙한",tip:"mat(때)+ure=때가 된 것"}, {en:"mayor",ko:"시장",tip:"may(더 큰)+or=도시 대장"},
      {en:"meanwhile",ko:"그동안에",tip:"mean(사이)+while(동안)=사이"}, {en:"mechanic",ko:"정비공",tip:"mech(기계)+anic=기계 고침"}, {en:"mechanism",ko:"구조, 기제",tip:"mech(기계)+anism=작동 방식"}, {en:"mediate",ko:"중재하다",tip:"medi(중간)+ate(하다)=중간에 섬"}, {en:"medieval",ko:"중세의",tip:"medi(중간)+ev(시대)=중간 시대"},
      {en:"medium",ko:"매체, 중간의",tip:"medi(중간)+um=중간인 것"}, {en:"merchant",ko:"상인",tip:"merch(물건)+ant(사람)=판매자"}, {en:"mere",ko:"단지 ~에 불과한",tip:"메(me)아리(re)처럼 빈 것"}, {en:"merge",ko:"합병하다",tip:"머(mer)지? 하나로 합쳐짐"}, {en:"merit",ko:"장점, 가치",tip:"메리(meri)트가 있는 상품"},
      {en:"metropolitan",ko:"대도시의",tip:"metro(도시)+politan=큰 도시"}, {en:"microphone",ko:"마이크",tip:"micro(작은)+phone(소리)=증폭기"}, {en:"migrate",ko:"이주하다",tip:"migr(이동)+ate(하다)=옮기다"}, {en:"mild",ko:"온화한",tip:"마일드(mild)한 커피 맛"}, {en:"million",ko:"백만",tip:"mill(천)+ion=천이 천개"},
      {en:"mine",ko:"광산, 나의 것",tip:"내(mine) 광산이야"}, {en:"mineral",ko:"미네랄, 광물",tip:"mine(광산)+ral=캔 것"}, {en:"minimal",ko:"최소의",tip:"mini(작은)+mal=가장 작은"}, {en:"minimum",ko:"최소한도",tip:"mini(작은)+mum=최저치"}, {en:"ministry",ko:"부처, 성직",tip:"mini(하인)+stry=돕는 곳"},
      {en:"miracle",ko:"기적",tip:"mira(놀라다)+cle(것)=기적"}, {en:"missile",ko:"미사일",tip:"miss(보내다)+ile(물건)=날려보냄"}, {en:"mobile",ko:"이동하는",tip:"mob(움직이다)+ile(쉬운)=이동성"}, {en:"mock",ko:"조롱하다",tip:"목(mock)소리로 놀리며 조롱"}, {en:"mode",ko:"방식",tip:"mod(틀)=형태나 방식"},
      {en:"modify",ko:"수정하다",tip:"mod(틀)+ify(만들다)=틀을 바꾸다"}, {en:"moderate",ko:"적당한",tip:"mod(틀)+erate=틀에 맞춘 적당함"}, {en:"modest",ko:"겸손한",tip:"mod(틀)+est=틀 안에 있는 겸손"}, {en:"moist",ko:"습기 있는",tip:"목(moi)이 마르지 않은 습한 상태"}, {en:"molecule",ko:"분자",tip:"mole(덩어리)+cule(작은)=입자"},
      {en:"monster",ko:"괴물",tip:"monstr(보여주다)=보여서 경고함"}, {en:"monument",ko:"기념비",tip:"monu(기억)+ment(것)=기억물"}, {en:"mortal",ko:"치명적인",tip:"mort(죽음)+al=죽을 운명의"}, {en:"motive",ko:"동기",tip:"mot(움직이다)+ive=움직이게 함"}, {en:"multiple",ko:"다수의",tip:"multi(많은)+ple(겹)=여러 겹"},
      {en:"murder",ko:"살인",tip:"머(mur)리 위로 덮치는 더(der) 무서운 살인"}, {en:"mutual",ko:"서로의",tip:"mut(바꾸다)+ual=서로 교환하는"}, {en:"myth",ko:"신화",tip:"미(my)지의 신(th)비한 이야기"}, {en:"naive",ko:"순진한",tip:"na(태어나다)+ive=갓 태어난듯함"}, {en:"naked",ko:"벌거벗은",tip:"내(na) 몸이 궤(ke)도 밖 노출된"},
      {en:"narrate",ko:"이야기하다",tip:"nar(알다)+rate=알게 말해주다"}, {en:"nasty",ko:"불쾌한",tip:"내(nas) 스(t)타일 아닌 불쾌함"}, {en:"needle",ko:"바늘",tip:"need(필요)+le=꿰맬 때 꼭 필요"}, {en:"negate",ko:"부인하다",tip:"neg(부정)+ate=아니라고 하다"}, {en:"neglect",ko:"방치하다",tip:"neg(안)+lect(모으다)=돌보지 않음"},
      {en:"negotiate",ko:"협상하다",tip:"neg(안)+ot(여가)+iate=일하며 협상"}, {en:"nephew",ko:"조카",tip:"내(ne) 피(phew) 섞인 남자 조카"}, {en:"network",ko:"네트워크",tip:"net(그물)+work(일)=그물망 조직"}, {en:"neutral",ko:"중립의",tip:"neut(어느 쪽도 아님)+ral"}, {en:"nevertheless",ko:"그럼에도 불구하고",tip:"never+the+less=결코 적지않게"},
      {en:"nightmare",ko:"악몽",tip:"night(밤)+mare(암말/귀신)=밤귀신"},
    ]
  },
  {
    id:18, title:"심화 어휘 D", emoji:"🏆",
    color:"#F472B6", dark:"#be185d",
    desc:"공통 심화 어휘 619~824번",
    words:[
      {en:"noble",ko:"귀족의",tip:"no(알다)+ble=이름이 잘 알려진"}, {en:"nod",ko:"끄덕이다",tip:"노(no) 하지 않고 고개 끄덕(d)"}, {en:"nominate",ko:"지명하다",tip:"nom(이름)+inate=이름을 부르다"}, {en:"nonetheless",ko:"그럼에도 불구하고",tip:"none+the+less=그렇다 해도"}, {en:"norm",ko:"규범",tip:"nor(m)말한 기준=표준 규범"},
      {en:"novel",ko:"소설",tip:"nov(새로운)+el=새로운 이야기"}, {en:"nuclear",ko:"핵의",tip:"nuc(핵)+lear=핵심의"}, {en:"numerous",ko:"수많은",tip:"numer(수)+ous(많은)=수많은"}, {en:"obey",ko:"복종하다",tip:"ob(향해)+ey(듣다)=말을 잘 듣다"}, {en:"oblige",ko:"의무를 지우다",tip:"ob(향해)+lige(묶다)=매어두다"},
      {en:"obsess",ko:"강박감을 갖다",tip:"ob(앞)+sess(앉다)=머릿속 점령"}, {en:"obtain",ko:"얻다",tip:"ob(향해)+tain(잡다)=가서 얻다"}, {en:"occupy",ko:"차지하다",tip:"oc(향해)+cupy(잡다)=잡아 점령함"}, {en:"offend",ko:"화나게 하다",tip:"of(대항)+fend(치다)=기분 상하게 함"}, {en:"opportune",ko:"적절한",tip:"op(향해)+port(항구)=항구로 향한"},
      {en:"opt",ko:"선택하다",tip:"옵션(opt-ion)중 하나를 선택"}, {en:"optimist",ko:"낙천주의자",tip:"opti(최상)+mist=좋게 보는 사람"}, {en:"oral",ko:"입의",tip:"or(입)+al=입으로 하는"}, {en:"orbit",ko:"궤도",tip:"orb(원)+it(가다)=원을 그리며 감"}, {en:"orchestra",ko:"오케스트라",tip:"무대 위 여러 악기들의 합주"},
      {en:"organ",ko:"장기",tip:"org(일하다)+an=몸 안의 일꾼"}, {en:"orient",ko:"동양",tip:"ori(솟다)+ent=해가 솟는 동쪽"}, {en:"origin",ko:"기원",tip:"ori(솟다)+gin(발생)=솟아난 시작"}, {en:"outcome",ko:"결과",tip:"out(밖)+come(나오다)=나온 결과"}, {en:"outline",ko:"개요",tip:"out(밖)+line(선)=겉 테두리 선"},
      {en:"output",ko:"생산",tip:"out(밖)+put(놓다)=내놓은 양"}, {en:"outrage",ko:"격노",tip:"out(넘어)+rage(화)=도를 넘은 화"}, {en:"outstanding",ko:"뛰어난",tip:"out(밖)+standing(서다)=눈에 띔"}, {en:"overcome",ko:"극복하다",tip:"over(너머)+come(오다)=넘어서다"}, {en:"overhead",ko:"머리 위의",tip:"over(위)+head(머리)=머리 위의"},
      {en:"overlap",ko:"겹치다",tip:"over(위)+lap(겹치다)=포개지다"}, {en:"overlook",ko:"간과하다",tip:"over(위로)+look(보다)=못보고 넘김"}, {en:"overnight",ko:"밤새도록",tip:"over(넘어)+night(밤)=밤을 넘겨"}, {en:"oversea",ko:"해외의",tip:"over(건너)+sea(바다)=바다 건너"}, {en:"overwhelm",ko:"압도하다",tip:"over(위)+whelm(덮다)=위에서 덮음"},
      {en:"owe",ko:"빚지다",tip:"오(o)! 왜(we) 돈을 빌렸을까"}, {en:"pace",ko:"속도",tip:"페이스(pace) 메이커의 달리기 속도"}, {en:"pad",ko:"패드",tip:"패(pa)드(d)를 덧대어 보호하다"}, {en:"pale",ko:"창백한",tip:"페(pa)인처럼 보일(le) 정도로 하얌"}, {en:"palm",ko:"손바닥",tip:"팜(palm) 나무 잎 같은 손바닥"},
      {en:"panel",ko:"판넬",tip:"판(pan)+el(작은)=작은 판 조각"}, {en:"parallel",ko:"평행의",tip:"para(옆)+llel(서로)=나란히 옆에"}, {en:"parliament",ko:"의회",tip:"parli(말하다)+ment=말하는 의회"}, {en:"participate",ko:"참여하다",tip:"parti(부분)+cip(잡다)=참가함"}, {en:"particle",ko:"입자",tip:"part(부분)+icle(작은)=작은 조각"},
      {en:"passage",ko:"통로",tip:"pass(지나가다)+age=지나가는 길"}, {en:"passenger",ko:"승객",tip:"pass(지나가다)+enger=타는 사람"}, {en:"passion",ko:"열정",tip:"pass(고통/강한느낌)+ion=뜨거움"}, {en:"passport",ko:"여권",tip:"pass(통과)+port(항구)=항구 통과"}, {en:"pat",ko:"톡톡 두드리기",tip:"패(pat)트병 치듯 가볍게 톡톡"},
      {en:"patch",ko:"조각",tip:"패(pat)치(ch)를 붙여 구멍 메우기"}, {en:"patent",ko:"특허",tip:"pat(열다)+ent=모두에게 공개"}, {en:"pave",ko:"포장하다",tip:"페이(pa)브(ve)먼트로 길 닦기"}, {en:"peak",ko:"꼭대기",tip:"피(pea)크(k)치에 달한 산봉우리"}, {en:"peasant",ko:"소작농",tip:"peas(시골)+ant(사람)=농민"},
      {en:"peel",ko:"껍질을 벗기다",tip:"피(pee)부(l) 껍질을 까듯 벗김"}, {en:"peer",ko:"또래",tip:"피(pee)차 똑같은(r) 동료 또래"}, {en:"penalty",ko:"처벌",tip:"pen(벌)+alty=벌을 주는 벌금"}, {en:"perceive",ko:"인지하다",tip:"per(완전)+ceive(잡다)=깨닫다"}, {en:"permanent",ko:"영구적인",tip:"per(내내)+man(머물다)=계속됨"},
      {en:"permit",ko:"허락하다",tip:"per(통과)+mit(보내다)=허가함"}, {en:"persist",ko:"고집하다",tip:"per(계속)+sist(서다)=끝까지 버팀"}, {en:"perspective",ko:"관점",tip:"per(통해)+spect(보다)=꿰뚫어 봄"}, {en:"persuade",ko:"설득하다",tip:"per(완전)+suade(달콤하게)=권하다"}, {en:"phase",ko:"단계",tip:"패(pha)세(se)별로 나뉜 단계"},
      {en:"phenomenon",ko:"현상",tip:"pheno(보이다)+menon=보이는 것"}, {en:"philosophy",ko:"철학",tip:"philo(사랑)+sophy(지혜)=지혜 사랑"}, {en:"phrase",ko:"구절",tip:"프(ph)레이(ra)즈(se) 한 문장 구절"}, {en:"physics",ko:"물리학",tip:"phys(자연)+ics(학)=자연의 법칙"}, {en:"pill",ko:"알약",tip:"pill(필)->필요할 때 먹는 알약"},
      {en:"pinch",ko:"꼬집다",tip:"핀(pin)처럼 찌르듯 꼬집다"}, {en:"pioneer",ko:"개척자",tip:"pion(보병)+eer(사람)=앞서가는 자"}, {en:"platform",ko:"승강장",tip:"plat(평평)+form(형태)=단상"}, {en:"plot",ko:"줄거리",tip:"p(플)+lot(땅/운명)=구성/음모"}, {en:"polish",ko:"닦다",tip:"폴폴(pol) 광이 나게 닦다"},
      {en:"poll",ko:"투표",tip:"머리(poll) 수를 세는 투표"}, {en:"pond",ko:"연못",tip:"p(폰)+ond(물)=작은 연못"}, {en:"populate",ko:"살다",tip:"popul(사람)+ate(하다)=거주하다"}, {en:"portion",ko:"부분",tip:"port(나누다)+ion=몫/부분"}, {en:"portrait",ko:"초상화",tip:"portra(그리다)+it=인물화"},
      {en:"pose",ko:"자세를 취하다",tip:"pose(놓다)=특정한 자세"}, {en:"posit",ko:"상정하다",tip:"posit(놓다)=사실로 두다"}, {en:"praise",ko:"칭찬하다",tip:"price(가치)를 높게 주다"}, {en:"preach",ko:"설교하다",tip:"pre(앞)+ach(말하다)=설교하다"}, {en:"precede",ko:"앞서다",tip:"pre(앞)+cede(가다)=먼저 일어나다"},
      {en:"precise",ko:"정확한",tip:"pre(앞)+cise(자르다)=딱 맞게 자른"}, {en:"predator",ko:"포식자",tip:"preda(먹이)+tor(자)=사냥꾼"}, {en:"predict",ko:"예측하다",tip:"pre(미리)+dict(말하다)=예언하다"}, {en:"prejudice",ko:"편견",tip:"pre(미리)+judice(판단)=선입견"}, {en:"premium",ko:"할증금",tip:"pre(앞)+em(사다)=덤/장려금"},
      {en:"prescribe",ko:"처방하다",tip:"pre(미리)+scribe(쓰다)=처방전"}, {en:"preserve",ko:"보존하다",tip:"pre(미리)+serve(지키다)=유지하다"}, {en:"preside",ko:"주재하다",tip:"pre(앞)+side(앉다)=의장을 맡다"}, {en:"presume",ko:"가정하다",tip:"pre(미리)+sume(취하다)=추측하다"}, {en:"prevail",ko:"우세하다",tip:"pre(앞)+vail(강함)=압도하다"},
      {en:"prey",ko:"먹이",tip:"p(프)+rey(레이)->사냥감"}, {en:"priest",ko:"신부",tip:"p(프)+riest(성직자)=성직자"}, {en:"primitive",ko:"원시의",tip:"prim(처음)+itive=태초의"}, {en:"principal",ko:"교장",tip:"prin(제1의)+cipal(사람)=우두머리"}, {en:"prior",ko:"이전의",tip:"pri(앞)+or=먼저인"},
      {en:"privilege",ko:"특권",tip:"privi(개인)+lege(법)=특전"}, {en:"professor",ko:"교수",tip:"pro(앞)+fess(말)+or(자)=교수"}, {en:"profile",ko:"옆모습",tip:"pro(앞)+file(선)=개요/윤곽"}, {en:"profound",ko:"심오한",tip:"pro(앞)+found(바닥)=깊은 곳의"}, {en:"prohibit",ko:"금지하다",tip:"pro(앞)+hibit(잡다)=막다"},
      {en:"prominent",ko:"저명한",tip:"pro(앞)+min(솟다)=두드러진"}, {en:"prompt",ko:"즉각적인",tip:"pro(앞)+mpt(가져오다)=지체없는"}, {en:"proof",ko:"증거",tip:"proo(f)(풀다)->입증하다"}, {en:"proportion",ko:"비율",tip:"pro(위해)+portion(몫)=비중"}, {en:"prospect",ko:"전망",tip:"pro(앞)+spect(보다)=가망성"},
      {en:"prosper",ko:"번영하다",tip:"pro(앞)+sper(희망)=성공하다"}, {en:"protein",ko:"단백질",tip:"prote(제1의)+in(물질)=필수양분"}, {en:"province",ko:"지방",tip:"pro(앞)+vince(이기다)=정복지"}, {en:"provoke",ko:"자극하다",tip:"pro(앞)+voke(부르다)=선동하다"}, {en:"psychology",ko:"심리학",tip:"psycho(영혼)+logy(학문)=심리"},
      {en:"publish",ko:"출판하다",tip:"publ(대중)+ish=널리 알리다"}, {en:"pupil",ko:"학생",tip:"pup(인형)+il=어린 제자/동공"}, {en:"pursue",ko:"추구하다",tip:"pur(앞)+sue(따르다)=뒤쫓다"}, {en:"quantity",ko:"양",tip:"quant(얼마나)+ity=분량"}, {en:"questionnaire",ko:"설문지",tip:"question(질문)+naire=질문서"},
      {en:"rage",ko:"분노",tip:"r(래)+age(이지)->레이지(분노)"}, {en:"rally",ko:"집결하다",tip:"re(다시)+ally(결합)=모이다"}, {en:"random",ko:"무작위의",tip:"ran(달리다)+dom(힘)=닥치는 대로"}, {en:"rank",ko:"등급",tip:"r(래)+ank(앙크)->지위/계급"}, {en:"rational",ko:"합리적인",tip:"rat(계산)+ional=이성적인"},
      {en:"raw",ko:"날것의",tip:"r(로)+aw(오)->익히지 않은"}, {en:"rear",ko:"뒤의",tip:"r(리)+ear(어)->뒤쪽/양육하다"}, {en:"rebel",ko:"반역자",tip:"re(반대)+bel(전쟁)=반란을 일으키다"}, {en:"receipt",ko:"영수증",tip:"re(다시)+ceipt(받다)=받은 증거"}, {en:"recruit",ko:"모집하다",tip:"re(다시)+cruit(자라다)=신병모집"},
      {en:"refine",ko:"정제하다",tip:"re(다시)+fine(좋은)=다듬다"}, {en:"reform",ko:"개혁하다",tip:"re(다시)+form(모양)=개선하다"}, {en:"refrigerate",ko:"냉장하다",tip:"re(다시)+frig(차갑다)=차게하다"}, {en:"regret",ko:"후회하다",tip:"re(뒤)+gret(울다)=아쉬워하다"}, {en:"regulate",ko:"규제하다",tip:"regul(법칙)+ate=조절하다"},
      {en:"reinforce",ko:"강화하다",tip:"re(다시)+in(안)+force(힘)=보강"}, {en:"reject",ko:"거절하다",tip:"re(뒤)+ject(던지다)=거부하다"}, {en:"relevant",ko:"관련된",tip:"re(다시)+lev(들다)=적절한"}, {en:"relieve",ko:"완화시키다",tip:"re(다시)+lieve(가볍게)=덜어주다"}, {en:"religion",ko:"종교",tip:"re(다시)+lig(묶다)=신과의 결합"},
      {en:"reluctant",ko:"꺼리는",tip:"re(뒤)+luct(싸우다)=주저하는"}, {en:"remedy",ko:"치료법",tip:"re(다시)+med(치유)=구제책"}, {en:"remote",ko:"멀리 떨어진",tip:"re(뒤)+mote(움직이다)=먼 곳의"}, {en:"republic",ko:"공화국",tip:"re(일)+public(대중)=국민의 나라"}, {en:"reputation",ko:"평판",tip:"re(다시)+put(생각)+ation=명성"},
      {en:"rescue",ko:"구조하다",tip:"re(다시)+scue(흔들다)=구출하다"}, {en:"resemble",ko:"닮다",tip:"re(다시)+semble(함께)=비슷하다"}, {en:"reside",ko:"거주하다",tip:"re(뒤)+side(앉다)=머무르다"}, {en:"resign",ko:"사임하다",tip:"re(뒤)+sign(서명)=물러나다"}, {en:"resolve",ko:"해결하다",tip:"re(다시)+solve(풀다)=다짐하다"},
      {en:"resort",ko:"휴양지",tip:"re(다시)+sort(나가다)=의지하다"}, {en:"restore",ko:"회복시키다",tip:"re(다시)+store(세우다)=복구하다"}, {en:"restrain",ko:"억제하다",tip:"re(뒤)+strain(당기다)=제지하다"}, {en:"restrict",ko:"제한하다",tip:"re(뒤)+strict(묶다)=한정하다"}, {en:"resume",ko:"재개하다",tip:"re(다시)+sume(취하다)=다시시작"},
      {en:"retail",ko:"소매",tip:"re(다시)+tail(자르다)=낱개판매"}, {en:"retain",ko:"유지하다",tip:"re(뒤)+tain(잡다)=간직하다"}, {en:"retreat",ko:"후퇴하다",tip:"re(뒤)+treat(당기다)=물러서다"}, {en:"reveal",ko:"드러내다",tip:"re(반대)+veal(베일)=밝히다"}, {en:"revenge",ko:"복수",tip:"re(다시)+venge(벌)=보복하다"},
      {en:"reverse",ko:"뒤집다",tip:"re(뒤)+verse(돌리다)=거꾸로의"}, {en:"revise",ko:"개정하다",tip:"re(다시)+vise(보다)=수정하다"}, {en:"revive",ko:"활기를 되찾다",tip:"re(다시)+vive(살다)=되살아나다"}, {en:"revolution",ko:"혁명",tip:"re(다시)+volu(돌다)=대변혁"}, {en:"reward",ko:"보상",tip:"re(다시)+ward(지켜보다)=보답"},
      {en:"rhythm",ko:"리듬",tip:"rhy(흐르다)+thm(박자)=율동"}, {en:"rid",ko:"제거하다",tip:"rid(리드)->제거해서 리드하다"}, {en:"ridicule",ko:"비웃다",tip:"ridi(웃다)+cule(작은)=조롱하다"}, {en:"riot",ko:"폭동",tip:"라이(라이브)+엇(엇나가다)"}, {en:"rival",ko:"경쟁자",tip:"강(river)을 낀 땅 경쟁"},
      {en:"roar",ko:"으르렁거리다",tip:"사자가 로어! 소리냄"}, {en:"roast",ko:"굽다",tip:"로스트 치킨 생각하기"}, {en:"rod",ko:"막대기",tip:"낚시로드(rod)는 막대기"}, {en:"romantic",ko:"낭만적인",tip:"로망(roman)+tic(의)"}, {en:"rot",ko:"썩다",tip:"로트(롯)겨서 썩다"},
      {en:"routine",ko:"일상",tip:"루틴(늘 하는 일)"}, {en:"rumor",ko:"소문",tip:"루머가 퍼지다"}, {en:"rural",ko:"시골의",tip:"루럴(누럴) 들판 시골"}, {en:"sack",ko:"자루, 해고하다",tip:"자루에 짐 싸서(sack) 가"}, {en:"sacred",ko:"신성한",tip:"sacr(신성)+ed(된)"},
      {en:"sacrifice",ko:"희생",tip:"sacri(신성)+fice(만들다)"}, {en:"satellite",ko:"인공위성",tip:"새(new)+텔(멀리)+라이트"}, {en:"scan",ko:"살피다",tip:"스캔해서 훑어보다"}, {en:"scandal",ko:"추문",tip:"스캔들 터지다"}, {en:"scarce",ko:"드문",tip:"스케(스케일)+어스(부족한)"},
      {en:"scatter",ko:"흩뿌리다",tip:"스캐터(스케이트)처럼 흩어짐"}, {en:"scheme",ko:"계획",tip:"스킴(스키마): 머릿속 계획"}, {en:"scholar",ko:"학자",tip:"schol(학교)+ar(사람)"}, {en:"scope",ko:"범위",tip:"스코프: 시야 범위"}, {en:"scramble",ko:"뒤섞다",tip:"스크램블 에그: 섞기"},
      {en:"screw",ko:"나사",tip:"나사 스크루를 돌리다"}, {en:"sculpt",ko:"조각하다",tip:"스컬(두개골) 조각"}, {en:"sector",ko:"부문",tip:"sect(자르다)+or(것)"}, {en:"seize",ko:"움켜잡다",tip:"손으로 씨즈(씌)게 잡다"}, {en:"sensible",ko:"현명한",tip:"sens(느끼다)+ible(가능한)"},
      {en:"sentiment",ko:"감정",tip:"senti(느끼다)+ment(명사)"}, {en:"sequence",ko:"순서",tip:"sequ(따르다)+ence(것)"}, {en:"severe",ko:"심각한",tip:"시비(severe)어하게 심한"}, {en:"shallow",ko:"얕은",tip:"샬로우(살살) 낮은 물"}, {en:"sigh",ko:"한숨 쉬다",tip:"사이(sigh)로 한숨 내쉬기"},
      {en:"silent",ko:"조용한",tip:"사일런트: 소리 없는"}, {en:"simulate",ko:"흉내 내다",tip:"시뮬레이션 해보다"}, {en:"simultaneous",ko:"동시의",tip:"simul(함께)+tane(시간)"}, {en:"sin",ko:"죄",tip:"신(sin) 앞에서 짓는 죄"}, {en:"skip",ko:"건너뛰다",tip:"스킵하고 넘어가다"},
      {en:"slice",ko:"조각",tip:"슬라이스 치즈 조각"},
    ]
  },
  {
    id:19, title:"수능의 성", emoji:"🏰",
    color:"#F472B6", dark:"#be185d",
    desc:"공통 심화 어휘 825~1010번",
    words:[
      {en:"slim",ko:"날씬한",tip:"슬림한 몸매"}, {en:"slope",ko:"기울기",tip:"슬로프: 경사진 곳"}, {en:"sneak",ko:"몰래 움직이다",tip:"스니커즈 신고 몰래 감"}, {en:"soak",ko:"적시다",tip:"쏙(soak) 담가 적시다"}, {en:"soap",ko:"비누",tip:"소프(비누)로 씻다"},
      {en:"sociology",ko:"사회학",tip:"socio(사회)+logy(학문)"}, {en:"sole",ko:"유일한",tip:"솔(soul)로, 혼자 뿐인"}, {en:"sophisticate",ko:"세련되게 하다",tip:"소피스트(지혜)+ate(하다)"}, {en:"span",ko:"기간",tip:"손뼉 한 뼘(span)의 길이"}, {en:"spark",ko:"불꽃",tip:"스파크가 튀다"},
      {en:"spectacle",ko:"장관",tip:"spect(보다)+acle(것)"}, {en:"spectrum",ko:"범위",tip:"spect(보다)+rum(범위)"}, {en:"sphere",ko:"구체",tip:"스피어: 둥근 공 모양"}, {en:"spill",ko:"쏟다",tip:"스르르 피(spill)를 쏟다"}, {en:"spit",ko:"침을 뱉다",tip:"스핏! 하고 침 뱉기"},
      {en:"splash",ko:"튀기다",tip:"스플래시! 물을 튀김"}, {en:"split",ko:"쪼개다",tip:"스플릿: 편 가르다"}, {en:"spouse",ko:"배우자",tip:"수포(spouse)자 없는 배우자"}, {en:"squeeze",ko:"짜내다",tip:"스퀴즈(슥 쥐다)해서 짜기"}, {en:"stack",ko:"쌓다",tip:"스택(식탁) 위에 쌓다"},
      {en:"stain",ko:"얼룩",tip:"스테인(슨 때) 얼룩"}, {en:"starve",ko:"굶주리다",tip:"스타(star)되려 굶다"}, {en:"statistic",ko:"통계",tip:"stat(상태)+istic(통계학)"}, {en:"statue",ko:"조각상",tip:"stat(서다)+ue: 서 있는 상"}, {en:"status",ko:"지위",tip:"stat(서다)+us: 서 있는 곳"},
      {en:"stem",ko:"줄기",tip:"시스템(stem)의 줄기"}, {en:"stiff",ko:"뻣뻣한",tip:"스티프(스티로폼)처럼 뻣뻣"}, {en:"stimulate",ko:"자극하다",tip:"stimul(찌르다)+ate(하다)"}, {en:"stitch",ko:"바늘땀",tip:"스테이플러처럼 콕(stitch)"}, {en:"stove",ko:"난로",tip:"스토브 리그: 난로 주위"},
      {en:"strain",ko:"긴장",tip:"스트레인(스팀) 올라 긴장"}, {en:"strict",ko:"엄격한",tip:"스트릭(스틱) 매로 엄하게"}, {en:"strip",ko:"벗기다",tip:"스트립 쇼: 옷을 벗다"}, {en:"stripe",ko:"줄무늬",tip:"스트라이프 무늬 옷"}, {en:"stroke",ko:"뇌졸중, 타격",tip:"스트로크: 공을 치다"},
      {en:"submarine",ko:"잠수함",tip:"sub(아래)+marine(바다)"}, {en:"submit",ko:"제출하다",tip:"sub(아래)+mit(보내다)"}, {en:"subscribe",ko:"구독하다",tip:"sub(아래)+scribe(쓰다)"}, {en:"substance",ko:"물질",tip:"sub(아래)+stance(서다)"}, {en:"substitute",ko:"대신하다",tip:"sub(아래)+stitute(세우다)"},
      {en:"subtle",ko:"미묘한",tip:"sub(아래)+tle: 섬세한"}, {en:"suburb",ko:"교외",tip:"sub(아래)+urb(도시)"}, {en:"suck",ko:"빨다",tip:"썩(suck) 빨아들이다"}, {en:"suffice",ko:"충분하다",tip:"suf(아래)+fice(만들다)"}, {en:"suicide",ko:"자살",tip:"sui(자신)+cide(죽이다)"},
      {en:"suite",ko:"스위트룸",tip:"스위트(sweet)한 방"}, {en:"summit",ko:"정상",tip:"sum(최고)+mit(지점)"}, {en:"superb",ko:"최고의",tip:"super(위)+erb(형용사)"}, {en:"superior",ko:"우월한",tip:"super(위)+ior(더 한)"}, {en:"supervise",ko:"감독하다",tip:"super(위)+vise(보다)"},
      {en:"supplement",ko:"보충",tip:"supple(채우다)+ment(명사)"}, {en:"surgery",ko:"수술",tip:"surg(손)+ery(기술)"}, {en:"surrender",ko:"항복하다",tip:"sur(위)+render(주다)"}, {en:"suspend",ko:"중단하다",tip:"sus(아래)+pend(매달다)"}, {en:"sustain",ko:"유지하다",tip:"sus(아래)+tain(잡다)"},
      {en:"swear",ko:"욕하다, 맹세하다",tip:"수워(swear) 맹세해"}, {en:"sweat",ko:"땀",tip:"스웨터(sweat) 입어 땀나"}, {en:"swell",ko:"부풀다",tip:"수웰(쑥 올라) 부풀다"}, {en:"swift",ko:"빠른",tip:"스위프트(휘릭) 빠르게"}, {en:"symbol",ko:"상징",tip:"sym(함께)+bol(던지다)"},
      {en:"sympathy",ko:"동정",tip:"sym(함께)+pathy(느낌)"}, {en:"symphony",ko:"교향곡",tip:"sym(함께)+phony(소리)=교향곡"}, {en:"symptom",ko:"증상, 징후",tip:"sym(함께)+ptom(떨어지다)=증상"}, {en:"tackle",ko:"씨름하다, 해결하다",tip:"축구 태클처럼 문제와 씨름하다"}, {en:"tag",ko:"꼬리표, 술래잡기",tip:"옷에 달린 태그(tag)는 꼬리표"},
      {en:"talent",ko:"재능, 장기",tip:"TV 속 탤런트는 재능이 많아"}, {en:"task",ko:"업무, 과업",tip:"태스크(Task) 포스는 업무 팀"}, {en:"tease",ko:"놀리다, 괴롭히다",tip:"티(tea) 내며 놀리다=놀리다"}, {en:"telegraph",ko:"전신, 전보",tip:"tele(멀리)+graph(쓰다)=전신"}, {en:"temple",ko:"절, 사원, 관자놀이",tip:"절에 가서 템플 스테이 하다"},
      {en:"temporary",ko:"일시적인",tip:"tempor(시간)+ary=잠깐의 시간"}, {en:"tempt",ko:"유혹하다, 부추기다",tip:"템테이션(유혹)은 유혹하는 것"}, {en:"tenant",ko:"세입자, 임차인",tip:"ten(잡다)+ant(사람)=집 잡은 사람"}, {en:"tender",ko:"부드러운, 다정한",tip:"텐더 치킨은 부드러운 고기"}, {en:"terminal",ko:"종점, 터미널, 말기의",tip:"term(끝)+inal=끝 지점"},
      {en:"terminate",ko:"종결시키다, 끝나다",tip:"term(끝)+inate=끝내다"}, {en:"terrace",ko:"테라스, 대지",tip:"terr(땅)+ace=평평한 땅"}, {en:"terrific",ko:"아주 멋진, 훌륭한",tip:"공포(terr)를 느낄만큼 멋진"}, {en:"territory",ko:"영토, 지역",tip:"terr(땅)+itory=땅의 범위"}, {en:"terror",ko:"공포, 테러",tip:"테러(terror)는 공포를 유발함"},
      {en:"theme",ko:"주제, 테마",tip:"테마(theme) 공원의 주제"}, {en:"therapy",ko:"치료, 요법",tip:"테라피(therapy)는 치료법"}, {en:"thorough",ko:"철저한, 빈틈없는",tip:"thor(통과)+ough=쭉 뚫고 가는"}, {en:"thread",ko:"실, 줄거리",tip:"실(thread)로 꿰매는 줄거리"}, {en:"thrill",ko:"전율, 설렘",tip:"스릴(thrill) 넘치는 전율"},
      {en:"thumb",ko:"엄지손가락",tip:"최고일 때 엄지(thumb) 척!"}, {en:"tick",ko:"체크 표시, 째깍거리다",tip:"시계가 째깍(tick) 체크표시"}, {en:"timber",ko:"목재, 재목",tip:"팀버(timber)! 나무 쓰러진다!"}, {en:"tissue",ko:"조직, 화장지",tip:"티슈(tissue) 한 장과 세포 조직"}, {en:"torture",ko:"고문, 고통",tip:"tort(비틀다)+ure=몸을 비트는 고문"},
      {en:"toss",ko:"가볍게 던지다",tip:"토스(toss) 하듯 가볍게 던져"}, {en:"toxic",ko:"독성의, 유독한",tip:"tox(독)+ic=독이 있는"}, {en:"tragic",ko:"비극적인",tip:"trag(염소)+ic=슬픈 비극"}, {en:"trail",ko:"흔적, 오솔길, 끌다",tip:"뒤에 끌리는(trail) 흔적"}, {en:"transact",ko:"거래하다, 처리하다",tip:"trans(가로질러)+act(행하다)=거래"},
      {en:"transform",ko:"변형시키다",tip:"trans(바꾸어)+form(형태)=변형"}, {en:"transition",ko:"변천, 이행",tip:"trans(이동)+it(가다)+ion=과정"}, {en:"translate",ko:"번역하다, 옮기다",tip:"trans(바꾸어)+late(나르다)=번역"}, {en:"transmit",ko:"전송하다, 전달하다",tip:"trans(너머)+mit(보내다)=전송"}, {en:"treasure",ko:"보물, 소중히 여기다",tip:"트레저(treasure)는 보물"},
      {en:"treaty",ko:"조약, 협정",tip:"treat(다루다)+y=국가간 협정"}, {en:"tremendous",ko:"엄청난, 대단한",tip:"trem(떨다)+endous=떨릴만큼 큰"}, {en:"trend",ko:"경향, 추세",tip:"요즘 트렌드(trend)는 추세"}, {en:"tribe",ko:"부족, 종족",tip:"트라이벌(tribe) 문양은 부족 상징"}, {en:"trigger",ko:"방아쇠, 유발하다",tip:"방아쇠 당겨 사건 유발(trigger)"},
      {en:"trim",ko:"다듬다, 정돈하다",tip:"머리를 트림(trim) 있게 다듬다"}, {en:"triumph",ko:"승리, 대성공",tip:"트라이엄프(triumph)는 대승리"}, {en:"troop",ko:"무리, 군대",tip:"트루퍼(troop)는 군대 무리"}, {en:"tube",ko:"관, 튜브",tip:"튜브(tube)는 긴 원통형 관"}, {en:"tunnel",ko:"터널, 지하도",tip:"산을 뚫은 터널(tunnel)"},
      {en:"turnover",ko:"이직률, 매출액",tip:"turn(돌고)+over(넘어짐)=회전율"}, {en:"ultimate",ko:"최종적인, 궁극적인",tip:"ultim(끝)+ate=마지막의"}, {en:"undergo",ko:"겪다, 경험하다",tip:"under(아래)+go(가다)=고난을 겪다"}, {en:"underlie",ko:"기초가 되다",tip:"under(아래)+lie(놓이다)=바탕"}, {en:"undermine",ko:"약화시키다",tip:"under(아래)+mine(파다)=기초 깎기"},
      {en:"undertake",ko:"떠맡다, 착수하다",tip:"under(아래)+take(잡다)=맡기"}, {en:"unify",ko:"통합하다, 통일하다",tip:"uni(하나)+fy(만들다)=통합"}, {en:"unique",ko:"독특한, 유일한",tip:"uni(하나)+que=오직 하나인"}, {en:"universe",ko:"우주, 전 세계",tip:"uni(하나)+verse(돌다)=전 우주"}, {en:"update",ko:"최신화하다",tip:"up(위)+date(날짜)=최신 날짜로"},
      {en:"upward",ko:"위쪽으로",tip:"up(위)+ward(방향)=위로"}, {en:"urban",ko:"도시의",tip:"어반(urban) 스타일은 도시적"}, {en:"urge",ko:"촉구하다, 충동",tip:"어지(urge)럽게 촉구하다"}, {en:"utilize",ko:"이용하다",tip:"uti(사용)+lize=유용하게 쓰다"}, {en:"utter",ko:"말하다, 완전한",tip:"어터(utter)케 말하지? 완전하게"},
      {en:"vacate",ko:"비우다, 떠나다",tip:"vac(비우다)+ate=빈 공간 만들기"}, {en:"vaccine",ko:"백신, 예방 접종",tip:"백신(vaccine) 맞고 예방하기"}, {en:"vacuum",ko:"진공, 공백",tip:"vac(비우다)+uum=텅 빈 진공"}, {en:"vague",ko:"모호한, 희미한",tip:"배이그(vague)해서 안보여요"}, {en:"valid",ko:"유효한, 타당한",tip:"val(가치)+id=가치 있는 유효함"},
      {en:"vanish",ko:"사라지다",tip:"van(비우다)+ish=마술처럼 사라져"}, {en:"vast",ko:"방대한, 거대한",tip:"베스트(vast)하게 넓은 땅"}, {en:"venture",ko:"모험, 벤처",tip:"vent(오다)+ure=위험에 뛰어들기"}, {en:"verb",ko:"동사",tip:"벌브(verb)는 행동을 말함"}, {en:"verse",ko:"운문, (시의) 연",tip:"ver(돌다)+se=줄이 바뀌는 시"},
      {en:"versus",ko:"~대(對)",tip:"A vs(versus) B의 대결"}, {en:"vertical",ko:"수직의, 세로의",tip:"vert(돌다)+ical=세로로 곧은"}, {en:"vessel",ko:"그릇, 선박, 혈관",tip:"배(vessel)는 물 담는 그릇"}, {en:"veterinarian",ko:"수의사",tip:"벳(vet)은 동물 의사"}, {en:"via",ko:"~을 통하여, 거쳐",tip:"비행기 비아(via) 경유지"},
      {en:"vice",ko:"악, 부(副)-",tip:"바이스(vice) 회장은 부회장"}, {en:"victory",ko:"승리",tip:"vict(이기다)+ory=빅토리 승리"}, {en:"vigor",ko:"활기, 활력",tip:"비거(vigor)러스하게 활기찬"}, {en:"virgin",ko:"처녀의, 순결한",tip:"버진(virgin) 로드는 순결의 길"}, {en:"virtue",ko:"미덕, 장점",tip:"virt(가치)+ue=가치 있는 미덕"},
      {en:"virus",ko:"바이러스, 병균",tip:"컴퓨터 바이러스(virus)"}, {en:"visible",ko:"눈에 보이는",tip:"vis(보다)+ible=볼 수 있는"}, {en:"visual",ko:"시각의, 눈에 보이는",tip:"비주얼(visual)이 좋다=시각적"}, {en:"vital",ko:"필수적인, 활기찬",tip:"vit(생명)+al=살아있는 필수품"}, {en:"vivid",ko:"생생한, 선명한",tip:"viv(살다)+id=살아있는 듯 선명함"},
      {en:"vocabulary",ko:"어휘",tip:"voc(소리)+abulary=단어들의 집합"}, {en:"vocation",ko:"천직, 직업",tip:"voc(부르다)+ion=부름 받은 직업"}, {en:"wander",ko:"거닐다, 헤매다",tip:"완더(wander)링하며 돌아다님"}, {en:"warehouse",ko:"창고",tip:"ware(물건)+house(집)=물건집"}, {en:"warrant",ko:"보증하다, 영장",tip:"워런티(warrant) 카드는 보증서"},
      {en:"wealth",ko:"부, 재산",tip:"웰(well)+th=잘 사는 재력"}, {en:"weave",ko:"짜다, 엮다",tip:"위브(weave)로 천을 짜다"}, {en:"weed",ko:"잡초, 잡초를 뽑다",tip:"위드(weed)는 뽑아야 할 잡초"}, {en:"weird",ko:"기묘한, 이상한",tip:"위어드(weird)한 이상한 느낌"}, {en:"welfare",ko:"복지, 후생",tip:"well(잘)+fare(가다)=잘 지냄"},
      {en:"wheat",ko:"밀",tip:"화이트(wheat) 밀가루는 밀에서"}, {en:"whereas",ko:"~인 반면에",tip:"where(어디)+as(~처럼)=반면에"}, {en:"whip",ko:"채찍질하다",tip:"휙(whip) 소리 나는 채찍질"}, {en:"wicked",ko:"사악한",tip:"wick(나쁜)+ed=사악한"}, {en:"wit",ko:"기지, 재치",tip:"wit(알다)=재치 있는 지혜"},
      {en:"withdraw",ko:"철회하다, 물러나다",tip:"with(뒤로)+draw(끌다)=철회"}, {en:"witness",ko:"목격자, 증인",tip:"wit(알다)+ness=본 사람, 증인"}, {en:"worship",ko:"숭배하다, 예배",tip:"worth(가치)+ship=숭배하다"}, {en:"wreck",ko:"파손시키다, 난파선",tip:"렉(wreck) 걸려 차가 파손됨"}, {en:"yield",ko:"양보하다, 산출하다",tip:"길(yield)을 비켜주다, 양보"},
      {en:"zone",ko:"구역, 지역",tip:"zone=일정한 구역"},
    ]
  },
];

const PASS_RATE     = 0.7;
const STAGE_SIZE    = 20;   // 한 스테이지당 단어 수
const XP_CORRECT    = 10;
const XP_WORLD      = 200;
const SWIPE_THRESH  = 80;

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const getStageCount = (world) => Math.ceil(world.words.length / STAGE_SIZE);

const initProgress = () => WORLDS.map(w => ({
  worldId: w.id,
  mastered: [],
  failed: [],
  cleared: false,
  stageCleared: new Array(getStageCount(w)).fill(false), // 70% 통과(잠금해제용)
  stageDone:    new Array(getStageCount(w)).fill(false), // 끝까지 풂(체크 표시용, 점수 무관)
}));

// ── 진행 상태 영구 저장 (localStorage) ───────────────────
// 모바일 브라우저는 홈 이동/탭 전환 시 페이지를 재로드하므로
// React 메모리 state만으로는 진행 기록이 사라진다 → localStorage에 영속화.
const PROGRESS_KEY = "wordgame_progress_v1";

// 저장된 진행 기록을 현재 WORLDS 구조에 맞춰 병합해 복원.
// (단어장/스테이지 수가 바뀌어도 안전)
const loadProgress = () => {
  const base = initProgress();
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return base;
    const saved = JSON.parse(raw);
    const savedProgress = Array.isArray(saved?.progress) ? saved.progress : [];
    return base.map((w) => {
      const s = savedProgress.find((p) => p && p.worldId === w.id);
      if (!s) return w;
      const stageCleared = w.stageCleared.map((v, i) =>
        Array.isArray(s.stageCleared) ? !!s.stageCleared[i] : v
      );
      const stageDone = w.stageDone.map((v, i) =>
        Array.isArray(s.stageDone) ? !!s.stageDone[i] : (stageCleared[i] || v)
      );
      return {
        ...w,
        mastered: Array.isArray(s.mastered) ? s.mastered : [],
        failed:   Array.isArray(s.failed)   ? s.failed   : [],
        cleared:  stageCleared.length > 0 && stageCleared.every(Boolean),
        stageCleared,
        stageDone,
      };
    });
  } catch (e) {
    return base;
  }
};

const loadStat = (key, fallback) => {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return fallback;
    const saved = JSON.parse(raw);
    const v = saved?.[key];
    return typeof v === "number" && !isNaN(v) ? v : fallback;
  } catch (e) {
    return fallback;
  }
};

// ── 메인 앱 ────────────────────────────────────────────────

// ── 커스텀 단어장 파싱 ──────────────────────────────────
const parseCustomWords = (text) => {
  if (!text) return [];
  const lines = text.split(/\r?\n/);
  const result = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const match = trimmed.match(/^([^\t, ]+)[\t, ]+(.+)$/);
    if (match) {
      result.push({ en: match[1].trim(), ko: match[2].trim(), tip: "" });
    } else {
      result.push({ en: trimmed, ko: "", tip: "" });
    }
  }
  return result;
};

export default function WordGame() {
  usePageSeo({
    title: "초중고 영단어 플래시카드 | 교육부 필수 영단어 암기",
    description: "교육부 권장 3,000 영단어를 플래시카드로 재미있게 암기. 초등 797·중고등 2,210 필수 영어단어. 가입 없이 무료 영단어 암기 학습.",
    keywords: "영단어 암기, 영어단어장, 초등 영단어, 중학 영단어, 고등 영단어, 교육부 영단어, 플래시카드 영어, 영단어 앱",
    url: "https://fun.uncledison.com/english",
    image: "https://fun.uncledison.com/assets/wordgame_banner.png",
  });
  const [progress,        setProgress]        = useState(loadProgress);
  const [xp,              setXp]              = useState(() => loadStat("xp", 0));
  const [streak,          setStreak]          = useState(() => loadStat("streak", 0));
  const [screen,          setScreen]          = useState(() => {
    try {
      if (localStorage.getItem("custom_only_mode") === "true") return "customVocab";
      // 학년을 한 번이라도 골랐으면(열어뒀으면) 맵으로 복귀
      try {
        const us = JSON.parse(localStorage.getItem('wordgame_unlocked_starts') || '[]');
        if (Array.isArray(us) && us.length > 0) return "map";
      } catch(e) {}
      // 저장된 진행 기록이 있으면 레벨선택 화면을 건너뛰고 맵으로 복귀.
      // 모바일 재로드 시 1판부터 다시 시작되던 오류 방지.
      const raw = localStorage.getItem(PROGRESS_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        const hasProgress = Array.isArray(saved?.progress) && saved.progress.some(p =>
          (p?.mastered?.length || p?.failed?.length || p?.cleared ||
           (Array.isArray(p?.stageCleared) && p.stageCleared.some(Boolean)))
        );
        if (hasProgress) return "map";
      }
      return "levelselect";
    } catch(e) { return "levelselect"; }
  });
  const [activeWorld,     setActiveWorld]     = useState(null);
  const [activeStage,     setActiveStage]     = useState(0);    // 현재 스테이지 (0부터)
  const [queue,           setQueue]           = useState([]);
  const [cardIdx,         setCardIdx]         = useState(0);
  const [flipped,         setFlipped]         = useState(false);
  const [swipeDir,        setSwipeDir]        = useState(null);
  const [dragX,           setDragX]           = useState(0);
  const [isDragging,      setIsDragging]      = useState(false);
  const [sessionCorrect,  setSessionCorrect]  = useState(0);
  const [sessionTotal,    setSessionTotal]    = useState(0);
  const [combo,           setCombo]           = useState(0);
  const [comboPopup,      setComboPopup]      = useState(false);
  const [animKey,         setAnimKey]         = useState(0);
  const [speakingWord,    setSpeakingWord]    = useState(null); // 발음 재생 중인 단어
  const [finalCorrect,    setFinalCorrect]    = useState(0);
  const [finalTotal,      setFinalTotal]      = useState(0);
  const [isReview,        setIsReview]        = useState(false); // 복습 모드 여부
  const [tab,             setTab]             = useState("map");  // map | vocab
  const [vocabFilter,     setVocabFilter]     = useState("mastered");  // all | mastered | failed
  const [expandedCard,    setExpandedCard]    = useState(null);   // 펼친 단어 en
  const [searchQuery,    setSearchQuery]    = useState("");      // 검색어
  const [showLevelConfirm, setShowLevelConfirm] = useState(false); // 레벨변경 확인 팝업
  const [showQuitConfirm, setShowQuitConfirm]   = useState(false); // 게임 중 나가기 팝업
  const [quitTarget,      setQuitTarget]        = useState("map"); // 나가기 후 이동할 탭
  const [participantCount, setParticipantCount] = useState(null); // 오늘 참여자 수
  const [customWorlds, setCustomWorlds] = useState(() => {
    try {
      const stored = localStorage.getItem('custom_worlds');
      return stored ? JSON.parse(stored) : [];
    } catch(e) { return []; }
  });
  const [customTitle, setCustomTitle] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [editingId, setEditingId] = useState(null);          // 편집 중인 커스텀 세트 id (null=새로 만들기)
  const [resumePrompt, setResumePrompt] = useState(null);    // 이어/처음 선택 팝업 대상 세트
  const [customResume, setCustomResume] = useState(() => {    // 세트별 이어하기 북마크
    try { return JSON.parse(localStorage.getItem('custom_resume') || '{}'); } catch(e) { return {}; }
  });
  const saveCustomResume = (id, rec) => {
    setCustomResume(prev => {
      const next = { ...prev, [id]: rec };
      try { localStorage.setItem('custom_resume', JSON.stringify(next)); } catch(e) {}
      return next;
    });
  };
  const clearCustomResume = (id) => {
    setCustomResume(prev => {
      const next = { ...prev }; delete next[id];
      try { localStorage.setItem('custom_resume', JSON.stringify(next)); } catch(e) {}
      return next;
    });
  };
  const [customOnlyMode, setCustomOnlyMode] = useState(() => {
    try { return localStorage.getItem('custom_only_mode') === 'true'; } catch(e) { return false; }
  });
  // 사용자가 "열어둔" 학년 시작 월드 id 목록 (학년 선택은 비파괴 — 진도 초기화 안 함)
  const [unlockedStarts, setUnlockedStarts] = useState(() => {
    try { const v = JSON.parse(localStorage.getItem('wordgame_unlocked_starts') || '[]'); return Array.isArray(v) ? v : []; } catch(e) { return []; }
  });
  const unlockGradeStart = (worldId) => {
    setUnlockedStarts(prev => {
      const next = prev.includes(worldId) ? prev : [...prev, worldId];
      try { localStorage.setItem('wordgame_unlocked_starts', JSON.stringify(next)); } catch(e) {}
      return next;
    });
  };
  const levelStartWorldRef = useRef(loadStat("levelStartWorld", 1));   // 현재 선택된 레벨의 시작 월드 ID (복원)
  const scrollTargetRef = useRef(levelStartWorldRef.current > 1 ? levelStartWorldRef.current : null);   // 맵 진입 시 스크롤 대상 (ref로 클로저 문제 방지)
  const [scrollTrigger, setScrollTrigger] = useState(0); // 스크롤 강제 실행 트리거

  const touchStartX = useRef(0);
  const touchCurX   = useRef(0);
  const processingRef = useRef(false);

  // ── 진행 상태 영구 저장 ────────────────────────────────
  // progress/xp/streak이 바뀔 때마다 localStorage에 저장 →
  // 모바일에서 페이지 재로드돼도 클리어한 스테이지가 유지된다.
  useEffect(() => {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify({ progress, xp, streak, levelStartWorld: levelStartWorldRef.current }));
    } catch (e) { /* 저장 실패 무시 */ }
  }, [progress, xp, streak]);

  // ── 참여자 수 계산 (시간대별 기반 + localStorage 누적) ───────────────
  useEffect(() => {
    const calculateBaseCount = (hour, minutes) => {
      let base = 0;
      if (hour < 6) base = 12;
      else if (hour < 9) base = 45;
      else if (hour < 12) base = 95;
      else if (hour < 14) base = 140;
      else if (hour < 18) base = 210;
      else if (hour < 22) base = 280;
      else base = 160;
      return base + Math.floor(minutes * 0.4);
    };
    const now = new Date();
    const dateKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    const storageKey = `wordgame_participants_${dateKey}`;
    const stored = localStorage.getItem(storageKey);
    const newBase = calculateBaseCount(now.getHours(), now.getMinutes());
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        let nextCount = parsed.count;
        const timeDiff = now.getTime() - new Date(parsed.timestamp).getTime();
        if (timeDiff > 1000 * 60 * 3) nextCount += Math.floor(Math.random() * 3) + 1;
        else if (timeDiff > 1000 * 30 && nextCount <= newBase) nextCount += 1;
        if (nextCount < newBase) nextCount = newBase + Math.floor(Math.random() * 5);
        setParticipantCount(nextCount);
        localStorage.setItem(storageKey, JSON.stringify({ count: nextCount, timestamp: now.toISOString() }));
      } catch(e) {
        const c = newBase + Math.floor(Math.random() * 5);
        setParticipantCount(c);
        localStorage.setItem(storageKey, JSON.stringify({ count: c, timestamp: now.toISOString() }));
      }
    } else {
      const c = newBase + Math.floor(Math.random() * 5);
      setParticipantCount(c);
      localStorage.setItem(storageKey, JSON.stringify({ count: c, timestamp: now.toISOString() }));
    }
  }, []);

  const level   = Math.floor(xp / 100) + 1;
  const xpMod   = xp % 100;

  // ── 해당 월드로 스크롤 (scrollTrigger 증가 시 항상 실행) ────────────
  useLayoutEffect(() => {
    if (!scrollTargetRef.current) return;
    const targetId = scrollTargetRef.current;
    scrollTargetRef.current = null;
    const HEADER = 126;
    const el = document.getElementById(`world-card-${targetId}`);
    if (el) {
      let top = 0;
      let cur = el;
      while (cur) { top += cur.offsetTop; cur = cur.offsetParent; }
      const target = Math.max(0, top - HEADER);
      document.documentElement.scrollTop = target;
      document.body.scrollTop = target;
    }
  }, [scrollTrigger]);

  const worlds = WORLDS.map((w, i) => {
    if (i === 0) return { ...w, unlocked: true };
    const prev = progress[i - 1];
    // 학년 선택으로 열어둔 시작 월드 OR 이전 월드 클리어 OR mastered 70% 이상이면 해제
    const unlocked = unlockedStarts.includes(w.id)
      || prev?.cleared
      || (prev ? prev.mastered.length / WORLDS[i - 1].words.length >= PASS_RATE : false);
    return { ...w, unlocked };
  });

  // ── 스테이지 단어 추출 헬퍼 ──────────────
  const getStageWords = (world, stageIdx) => {
    const start = stageIdx * STAGE_SIZE;
    return world.words.slice(start, start + STAGE_SIZE);
  };

  const getNextStage = (world, stageIdx) => {
    const totalStages = getStageCount(world);
    // 다음 스테이지 찾기 — 현재 이후 중 미클리어된 첫 번째
    for (let i = stageIdx + 1; i < totalStages; i++) {
      const p = progress.find(p => p.worldId === world.id);
      if (!p?.stageCleared[i]) return i;
    }
    // 모두 클리어면 0번부터 다시
    return 0;
  };

  // ── 게임 시작 (스테이지 기반 + 스테이지 도중 이어하기) ────────────
  const startWorld = (world, stageIdx = null) => {
    if (!world.unlocked) return;
    const p = progress.find(p => p.worldId === world.id);

    // 스테이지 도중에 저장한 북마크가 있으면 그 위치부터 이어하기
    // (명시적 stageIdx가 주어지면 = "다음 스테이지" 등 → 이어하기 무시)
    const rec = customResume[world.id];
    const canResume = stageIdx === null && rec && Array.isArray(rec.order) && rec.pos > 0 && rec.pos < rec.order.length;

    let targetStage, queueArr, startIdx, correct, total;
    if (canResume) {
      targetStage = rec.stage || 0;
      const byEn = Object.fromEntries(world.words.map(w => [w.en, w]));
      queueArr = rec.order.map(en => byEn[en]).filter(Boolean);
      startIdx = Math.min(rec.pos, Math.max(0, queueArr.length - 1));
      correct = rec.correct || 0;
      total = rec.total || 0;
    } else {
      // 스테이지 결정 — 명시적으로 전달되면 그거, 아니면 첫 미클리어 스테이지
      targetStage = stageIdx;
      if (targetStage === null) {
        const totalStages = getStageCount(world);
        targetStage = 0;
        for (let i = 0; i < totalStages; i++) {
          if (!p?.stageCleared?.[i]) { targetStage = i; break; }
        }
      }
      const stageWords = getStageWords(world, targetStage);
      const failed = stageWords.filter(w => p?.failed.includes(w.en));   // 틀린 단어 우선
      const others = shuffle(stageWords.filter(w => !p?.failed.includes(w.en)));
      queueArr = [...failed, ...others];
      startIdx = 0; correct = 0; total = 0;
      clearCustomResume(world.id);   // 새 스테이지 시작 → 오래된 북마크 제거
    }

    setActiveWorld(world);
    setActiveStage(targetStage);
    setQueue(queueArr);
    setCardIdx(startIdx);
    setFlipped(false);
    setSwipeDir(null);
    setDragX(0);
    setSessionCorrect(correct);
    setSessionTotal(total);
    setCombo(0);
    setIsReview(false);
    processingRef.current = false;
    setScreen("game");
  };


  // 커스텀 세트의 진행 북마크가 유효한지 (중간에 멈춘 상태)
  const hasResume = (world) => {
    const rec = customResume[world.id];
    return !!(rec && Array.isArray(rec.order) && rec.pos > 0 && rec.pos < rec.order.length);
  };

  // 세트 클릭 → 진행 중이면 이어/처음 팝업, 아니면 바로 시작
  const openCustomWorld = (world) => {
    if (hasResume(world)) setResumePrompt(world);
    else startCustomWorld(world, false);
  };

  // resume=true 이어서 하기 / false 처음부터
  const startCustomWorld = (world, resume) => {
    let currentProgress = [...progress];
    let p = currentProgress.find(p => p.worldId === world.id);
    if (!p) {
      p = { worldId: world.id, mastered: [], failed: [], cleared: false, stageCleared: [false] };
      currentProgress.push(p);
      setProgress(currentProgress);
    }

    const rec = customResume[world.id];
    let orderEns, pos, correct, total;
    if (resume && rec && Array.isArray(rec.order)) {
      orderEns = rec.order;
      pos = rec.pos || 0;
      correct = rec.correct || 0;
      total = rec.total || 0;
    } else {
      // 처음부터: 새로 섞음 + 기존 북마크 제거
      orderEns = shuffle(world.words.map(w => w.en));
      pos = 0; correct = 0; total = 0;
      clearCustomResume(world.id);
    }

    // 저장된 영어 순서로 단어 객체 복원 (편집으로 사라진 단어는 건너뜀)
    const byEn = Object.fromEntries(world.words.map(w => [w.en, w]));
    const q = orderEns.map(en => byEn[en]).filter(Boolean);
    const startIdx = Math.min(pos, Math.max(0, q.length - 1));

    setActiveWorld({ ...world, unlocked: true, isCustom: true });
    setActiveStage(0);
    setQueue(q);
    setCardIdx(startIdx);
    setFlipped(false);
    setSwipeDir(null);
    setDragX(0);
    setSessionCorrect(correct);
    setSessionTotal(total);
    setCombo(0);
    setIsReview(false);
    processingRef.current = false;
    setResumePrompt(null);
    setScreen("game");
  };

  // 현재 진행 위치를 북마크에 저장 (복습 중이면 메인 위치를 덮어쓰지 않음)
  const persistCurrentResume = () => {
    if (activeWorld && !isReview) {
      saveCustomResume(activeWorld.id, {
        order: queue.map(c => c.en),
        pos: cardIdx,
        correct: sessionCorrect,
        total: sessionTotal,
        stage: activeStage,   // 고정 단어장: 어느 스테이지인지 기억
      });
    }
  };
  // 오늘 여기까지 — 현재 위치 저장 후 홈(커스텀=내 단어장 / 고정=맵)
  const saveCustomAndExit = () => {
    persistCurrentResume();
    setShowQuitConfirm(false);
    if (activeWorld?.isCustom) {
      setScreen("customVocab");
    } else {
      if (activeWorld) { scrollTargetRef.current = activeWorld.id; setScrollTrigger(t => t + 1); }
      setScreen("map");
    }
  };
  // 틀린 문제 풀기 — 현재 위치 자동 저장 후 복습 시작
  const reviewWithSave = () => {
    persistCurrentResume();
    setShowQuitConfirm(false);
    startReview(activeWorld);
  };

  // 커스텀 세트 편집 시작 (폼에 기존 내용 채움)
  const startEditCustom = (world) => {
    setEditingId(world.id);
    setCustomTitle(world.title);
    setCustomInput(world.words.map(w => (w.ko ? `${w.en} ${w.ko}` : w.en)).join("\n"));
  };
  const cancelEditCustom = () => {
    setEditingId(null);
    setCustomTitle("");
    setCustomInput("");
  };

  // ── 복습 모드 시작 ────────────────────────
  const startReview = (world) => {
    const p = progress.find(p => p.worldId === world.id);
    const failedWords = world.words.filter(w => p.failed.includes(w.en));
    if (!failedWords.length) return;
    setActiveWorld(world);
    setQueue(shuffle(failedWords));
    setCardIdx(0);
    setFlipped(false);
    setSwipeDir(null);
    setDragX(0);
    setSessionCorrect(0);
    setSessionTotal(0);
    setCombo(0);
    setIsReview(true);
    processingRef.current = false;
    setScreen("game");
  };

  // ── 스와이프 확정 ─────────────────────────
  const doSwipe = useCallback((dir) => {
    if (processingRef.current) return;
    processingRef.current = true;
    setSwipeDir(dir);
    setIsDragging(false);

    const correct = dir === "right";
    if (navigator.vibrate) navigator.vibrate(correct ? 40 : [40, 30, 40]);

    const newCombo = correct ? combo + 1 : 0;
    const gained   = correct ? XP_CORRECT + (newCombo >= 5 ? 5 : 0) : 0;

    setCombo(newCombo);
    if (correct && newCombo > 0 && newCombo % 3 === 0) {
      setComboPopup(true);
      setTimeout(() => setComboPopup(false), 1200);
    }
    setXp(x => x + gained);
    setStreak(s => correct ? s + 1 : 0);

    const sc = sessionCorrect + (correct ? 1 : 0);
    const st = sessionTotal  + 1;
    setSessionCorrect(sc);
    setSessionTotal(st);

    // progress — 즉시 계산해서 반영 (setProgress 비동기 문제 방지)
    const en         = queue[cardIdx].en;
    const curProg    = progress.find(p => p.worldId === activeWorld.id);
    const newMastered = correct
      ? [...new Set([...curProg.mastered, en])]
      : curProg.mastered.filter(w => w !== en);
    const newFailed   = correct
      ? curProg.failed.filter(w => w !== en)
      : [...new Set([...curProg.failed, en])];

    const updatedProgress = progress.map(p => {
      if (p.worldId !== activeWorld.id) return p;
      return { ...p, mastered: newMastered, failed: newFailed };
    });
    setProgress(updatedProgress);

    setTimeout(() => {
      const nextIdx = cardIdx + 1;
      if (nextIdx >= queue.length) {
        setFinalCorrect(sc);
        setFinalTotal(st);

        // 본 학습(스테이지)을 끝까지 풂 → 이어하기 북마크 삭제 (복습 완료는 제외)
        if (!isReview) clearCustomResume(activeWorld.id);

        const count = parseInt(localStorage.getItem('play_count') || '0') + 1;
        localStorage.setItem('play_count', count.toString());
        if (!localStorage.getItem('feedback_done') && [3, 10, 25, 50].includes(count)) {
          setTimeout(() => window.dispatchEvent(new Event("showFeedback")), 1200);
        }

        if (isReview) {
          setScreen("reviewdone");
        } else {
          const passed = sc / st >= PASS_RATE;
          // 끝까지 푼 스테이지: stageDone 체크(점수 무관) + 70% 이상이면 stageCleared(잠금해제)
          const finalProgress = updatedProgress.map(p => {
            if (p.worldId !== activeWorld.id) return p;
            const cnt = getStageCount(activeWorld);
            const baseDone = Array.isArray(p.stageDone) ? p.stageDone : new Array(cnt).fill(false);
            const newStageDone = baseDone.map((v, i) => i === activeStage ? true : v);
            const newStageCleared = passed
              ? p.stageCleared.map((v, i) => i === activeStage ? true : v)
              : p.stageCleared;
            return {
              ...p,
              stageDone: newStageDone,
              stageCleared: newStageCleared,
              cleared: newStageCleared.length > 0 && newStageCleared.every(Boolean),
            };
          });
          setProgress(finalProgress);
          if (passed) {
            setXp(x => x + XP_WORLD);
            setScreen("worldclear");
          } else {
            setScreen("result");
          }
        }
      } else {
        setCardIdx(nextIdx);
        setFlipped(false);
        setSwipeDir(null);
        setDragX(0);
        setAnimKey(k => k + 1);
        processingRef.current = false;
      }
    }, 350);
  }, [combo, sessionCorrect, sessionTotal, cardIdx, queue, activeWorld, isReview]);

  // ── 터치 핸들러 ──────────────────────────
  const onTouchStart = (e) => {
    if (processingRef.current) return;
    touchStartX.current = e.touches[0].clientX;
    touchCurX.current   = e.touches[0].clientX;
    setIsDragging(true);
    setDragX(0);
  };
  const onTouchMove = (e) => {
    if (!isDragging || processingRef.current) return;
    touchCurX.current = e.touches[0].clientX;
    setDragX(touchCurX.current - touchStartX.current);
  };
  const onTouchEnd = () => {
    if (!isDragging || processingRef.current) return;
    setIsDragging(false);
    const dx = touchCurX.current - touchStartX.current;
    if (Math.abs(dx) > SWIPE_THRESH) {
      doSwipe(dx > 0 ? "right" : "left");
    } else {
      setDragX(0);
    }
  };

  // 마우스 드래그 (PC)
  const onMouseDown = (e) => {
    if (processingRef.current) return;
    touchStartX.current = e.clientX;
    setIsDragging(true);
    setDragX(0);
  };
  const onMouseMove = (e) => {
    if (!isDragging || processingRef.current) return;
    setDragX(e.clientX - touchStartX.current);
  };
  const onMouseUp = () => {
    if (!isDragging || processingRef.current) return;
    setIsDragging(false);
    if (Math.abs(dragX) > SWIPE_THRESH) {
      doSwipe(dragX > 0 ? "right" : "left");
    } else {
      setDragX(0);
    }
  };

  const card   = queue[cardIdx];
  const w      = activeWorld;
  const absDx  = Math.abs(dragX);
  const swipeProgress = Math.min(absDx / SWIPE_THRESH, 1); // 0~1

  // ── 전체 단어 집계 ────────────────────────
  const targetWorlds = customOnlyMode ? customWorlds : WORLDS;

// 검색용 전체 단어 flat
  const searchAllWords = targetWorlds.flatMap(w =>
    w.words.map(word => ({ ...word, worldId: w.id, worldTitle: w.title, worldColor: w.color, worldEmoji: w.emoji }))
  );

  const allMastered = targetWorlds.flatMap(w => {
    const p = progress.find(p => p.worldId === w.id);
    return w.words.filter(word => p?.mastered.includes(word.en))
      .map(word => ({ ...word, worldTitle: w.title, worldColor: w.color, worldEmoji: w.emoji }));
  });
  const allFailed = targetWorlds.flatMap(w => {
    const p = progress.find(p => p.worldId === w.id);
    return w.words.filter(word => p?.failed.includes(word.en))
      .map(word => ({ ...word, worldTitle: w.title, worldColor: w.color, worldEmoji: w.emoji }));
  });
  const allWords = targetWorlds.flatMap(w =>
    w.words.map(word => {
      const p = progress.find(p => p.worldId === w.id);
      const isMastered = p?.mastered.includes(word.en);
      const isFailed   = p?.failed.includes(word.en);
      return { ...word, worldTitle: w.title, worldColor: w.color, worldEmoji: w.emoji, isMastered, isFailed };
    })
  );
  // vocabList → grouped 방식으로 대체됨

  // ── 공통 Fun.Uncle 헤더 ──────────────────────
  const FunUncleBar = ({ showLevel = false }: { showLevel?: boolean }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 0" }}>
      <button onClick={() => setScreen("levelselect")} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ color: "#fff", fontWeight: 900, fontSize: 23, letterSpacing: -0.8 }}>영단어</span>
        <span style={{ background: "linear-gradient(90deg,#FF8C00,#FF6B00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 800, fontSize: 13, letterSpacing: -0.3 }}>플래시카드</span>
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={() => window.dispatchEvent(new Event("showFeedback"))} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "6px 10px", borderRadius: 12, cursor: "pointer", fontSize: 14 }}>💌</button>
        {showLevel ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,184,0,0.1)", border: "1px solid rgba(255,184,0,0.25)", borderRadius: 12, padding: "6px 12px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#FFB800", fontSize: 16, fontWeight: 900, lineHeight: 1 }}>Lv.{level}</div>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 9, fontWeight: 700 }}>{xp} XP</div>
            </div>
          </div>
        ) : (
          <div style={{ background: "linear-gradient(135deg, rgba(255,184,0,0.2), rgba(255,184,0,0.05))", border: "1px solid rgba(255,184,0,0.3)", padding: "6px 14px", borderRadius: 20, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 14 }}>⚡</span>
            <span style={{ color: "#FFB800", fontWeight: 900, fontSize: 14 }}>{xp} XP</span>
          </div>
        )}
      </div>
    </div>
  );

  // ── 레벨변경 확인 팝업 ────────────────────────
  const LevelConfirmModal = () => !showLevelConfirm ? null : (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "0 24px" }}>
      <div style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 28, padding: "36px 28px", maxWidth: 340, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 16 }}>⚠️</div>
        <h3 style={{ color: "#fff", fontSize: 20, fontWeight: 900, margin: "0 0 12px" }}>레벨을 변경할까요?</h3>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 1.7, margin: "0 0 28px" }}>
          현재 학습 기록이 모두<br />초기화됩니다.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setShowLevelConfirm(false)}
            style={{ flex: 1, padding: "15px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
            취소
          </button>
          <button
            onClick={() => { setShowLevelConfirm(false); setScreen(customOnlyMode ? "customVocab" : "levelselect"); }}
            style={{ flex: 1, padding: "15px", background: "linear-gradient(135deg,#FF8C00,#FF6B00)", border: "none", borderRadius: 16, color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
            변경하기
          </button>
        </div>
      </div>
    </div>
  );

  // ── 게임 중 나가기 확인 팝업 ──────────────────
  const QuitConfirmModal = () => {
    if (!showQuitConfirm) return null;
    const canSave = !!activeWorld && !isReview;   // 복습 중엔 일반 나가기
    const cp = progress.find(pp => pp.worldId === activeWorld?.id);
    const hasFailed = (cp?.failed?.length || 0) > 0;
    const plainExit = () => {
      setShowQuitConfirm(false);
      if (activeWorld?.isCustom) { setScreen("customVocab"); return; }
      if (customOnlyMode && quitTarget === "map") {
        setScreen("customVocab");
      } else {
        setScreen("map");
        setTab(quitTarget);
      }
      if (!customOnlyMode && levelStartWorldRef.current > 1 && quitTarget === "map") {
        scrollTargetRef.current = levelStartWorldRef.current;
        setScrollTrigger(t => t + 1);
      }
    };
    return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "0 24px" }}>
      <div style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 28, padding: "36px 28px", maxWidth: 340, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 16 }}>{canSave ? "📌" : "🚪"}</div>
        <h3 style={{ color: "#fff", fontSize: 20, fontWeight: 900, margin: "0 0 12px" }}>{canSave ? "오늘은 여기까지?" : "학습을 종료할까요?"}</h3>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 1.7, margin: "0 0 28px" }}>
          {canSave
            ? <>지금 위치를 저장하면<br />다음에 <b style={{ color: "#A78BFA" }}>이어서 하기</b>로 계속할 수 있어요.</>
            : <>현재 스테이지 진행 기록은<br />저장되지 않습니다.</>}
        </p>
        {canSave ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={saveCustomAndExit}
              style={{ padding: "15px", background: "linear-gradient(135deg,#A78BFA,#6d28d9)", border: "none", borderRadius: 16, color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
              💾 저장하고 나가기
            </button>
            {hasFailed && (
              <button onClick={reviewWithSave}
                style={{ padding: "15px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 16, color: "#EF4444", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
                🔁 틀린 문제 풀기 ({cp.failed.length}개)
              </button>
            )}
            <button onClick={() => setShowQuitConfirm(false)}
              style={{ padding: "15px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              계속하기
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setShowQuitConfirm(false)}
              style={{ flex: 1, padding: "15px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              계속하기
            </button>
            <button onClick={plainExit}
              style={{ flex: 1, padding: "15px", background: "linear-gradient(135deg,#FF8C00,#FF6B00)", border: "none", borderRadius: 16, color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
              나가기
            </button>
          </div>
        )}
      </div>
    </div>
    );
  };

  // ── 이어서 하기 / 처음부터 하기 팝업 ────────────
  const ResumePromptModal = () => {
    if (!resumePrompt) return null;
    const rec = customResume[resumePrompt.id] || {};
    const total = Array.isArray(rec.order) ? rec.order.length : resumePrompt.words.length;
    const done = rec.pos || 0;
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "0 24px" }}>
        <div style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 28, padding: "36px 28px", maxWidth: 340, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 44, marginBottom: 16 }}>📖</div>
          <h3 style={{ color: "#fff", fontSize: 20, fontWeight: 900, margin: "0 0 8px" }}>{resumePrompt.title}</h3>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.7, margin: "0 0 24px" }}>
            지난번 <b style={{ color: "#A78BFA" }}>{done}번째</b>까지 했어요.<br />이어서 할까요? (총 {total}개)
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={() => startCustomWorld(resumePrompt, true)}
              style={{ padding: "15px", background: "linear-gradient(135deg,#A78BFA,#6d28d9)", border: "none", borderRadius: 16, color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
              ▶ 이어서 하기 ({done + 1}번부터)
            </button>
            <button onClick={() => startCustomWorld(resumePrompt, false)}
              style={{ padding: "15px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              🔄 처음부터 하기
            </button>
            <button onClick={() => setResumePrompt(null)}
              style={{ padding: "12px", background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              닫기
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── 카카오 공유 핸들러 ────────────────────────
  const handleKakaoShare = () => {
    const kakao = (window as any).Kakao;
    if (!kakao) return;
    if (!kakao.isInitialized()) kakao.init('8e68190d1ba932955a557fbf0ae0b659');
    kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: '영단어 플래시카드 🎴',
        description: "교육부 권장 단어부터 '나만의 단어장'까지! 스와이프로 쉽게 외워요✨",
        imageUrl: 'https://fun.uncledison.com/assets/wordgame_thumb.png',
        link: {
          mobileWebUrl: 'https://fun.uncledison.com/english',
          webUrl: 'https://fun.uncledison.com/english',
        },
      },
      buttons: [{ title: '공부하러 가기', link: { mobileWebUrl: 'https://fun.uncledison.com/english', webUrl: 'https://fun.uncledison.com/english' } }],
    });
  };

  // ── 하단 탭바 공통 컴포넌트 ─────────────────
  const TabBar = () => (
    <>
      {/* 카카오 플로팅 버튼 */}
      <button
        onClick={handleKakaoShare}
        style={{ position: "fixed", bottom: 90, right: 16, width: 48, height: 48, background: "#FAE100", borderRadius: "50%", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.3)", zIndex: 60 }}
        aria-label="카카오톡 공유"
      >
        <svg viewBox="0 0 512 512" style={{ width: 24, height: 24, marginLeft: 1, marginTop: 1 }} fill="#3C1E1E">
          <path d="M408 64H104a56.16 56.16 0 00-56 56v192a56.16 56.16 0 0056 56h40v80l93.72-78.14a8 8 0 015.13-1.86H408a56.16 56.16 0 0056-56V120a56.16 56.16 0 00-56-56z" />
          <circle cx="160" cy="216" r="32" fill="#FAE100" />
          <circle cx="256" cy="216" r="32" fill="#FAE100" />
          <circle cx="352" cy="216" r="32" fill="#FAE100" />
        </svg>
      </button>
      {/* 탭바 */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#0d0d18", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", zIndex: 50 }}>
        <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", display: "flex" }}>
        {[
          { key: "map",    label: "홈",      icon: "🏠" },
          { key: "vocab",  label: "내 단어장", icon: "📖" },
          { key: "search", label: "검색",     icon: "🔍" },
        ].map(t => (
          <button key={t.key} onClick={() => {
            if (screen === "game") {
              setQuitTarget(t.key);
              setShowQuitConfirm(true);
            } else {
              if (t.key === "map") {
                setScreen(customOnlyMode ? "customVocab" : "map");
                if (!customOnlyMode && levelStartWorldRef.current > 1) {
                  scrollTargetRef.current = levelStartWorldRef.current;
                  setScrollTrigger(t => t + 1);
                }
              } else {
                setScreen("map");
              }
              setTab(t.key);
              // GA 탭 방문 이벤트
              try { (window as any).gtag?.('event', 'tab_view', { tab: t.key, page: '/english' }); } catch(e) {}
            }
          }}
            style={{ flex: 1, padding: "12px 8px 20px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span style={{ color: tab === t.key ? "#FFB800" : "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 700 }}>{t.label}</span>
            {tab === t.key && <div style={{ width: 20, height: 2, background: "#FFB800", borderRadius: 2, marginTop: 2 }} />}
          </button>
        ))}
        </div>
      </div>
    </>
  );

  // ── 검색 화면 ──────────────────────────
  if (tab === "search" && screen === "map") {
    const q = searchQuery.trim().toLowerCase();
    const results = q.length < 1 ? [] : searchAllWords.filter(w =>
      w.en.toLowerCase().includes(q) || w.ko.includes(searchQuery.trim())
    );

    return (
      <div style={{ minHeight:"100dvh", background:"#07070f", fontFamily:"'Segoe UI',system-ui,sans-serif", display:"flex", justifyContent:"center" }}>
        <LevelConfirmModal />
        <div style={{ width:"100%", maxWidth:480, display:"flex", flexDirection:"column", paddingBottom:80 }}>
        {/* 헤더 */}
        <div style={{ background:"linear-gradient(180deg,#0e0e20 0%,#07070f 100%)" }}>
          <FunUncleBar showLevel={true} />
          <div style={{ padding:"12px 22px 16px" }}>
          <div style={{ color:"#fff", fontSize:24, fontWeight:900, marginBottom:16 }}>
            단어 <span style={{ background:"linear-gradient(90deg,#FFB800,#FF6B00)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>검색</span>
          </div>
          {/* 검색창 */}
          <div style={{ position:"relative" }}>
            <span style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", fontSize:16 }}>🔍</span>
            <input
              type="text"
              placeholder="영어 또는 한글로 검색..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoFocus
              style={{ width:"100%", padding:"14px 16px 14px 46px", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:16, color:"#fff", fontSize:16, fontWeight:600, outline:"none", boxSizing:"border-box" }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}
                style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"rgba(255,255,255,0.1)", border:"none", borderRadius:"50%", width:24, height:24, color:"rgba(255,255,255,0.5)", cursor:"pointer", fontSize:12 }}>
                ✕
              </button>
            )}
          </div>
          {q.length > 0 && (
            <div style={{ color:"rgba(255,255,255,0.25)", fontSize:11, fontWeight:600, marginTop:8 }}>
              {results.length > 0 ? `${results.length}개 검색됨` : "검색 결과 없음"}
            </div>
          )}
          </div>
        </div>

        {/* 검색 결과 */}
        <div style={{ padding:"0 22px", overflowY:"auto", flex:1 }}>
          {q.length === 0 ? (
            <div style={{ textAlign:"center", padding:"60px 20px" }}>
              <div style={{ fontSize:48, marginBottom:16 }}>🔍</div>
              <div style={{ color:"rgba(255,255,255,0.2)", fontSize:14, fontWeight:700 }}>영어 단어나 한글 뜻으로 검색하세요</div>
              <div style={{ color:"rgba(255,255,255,0.12)", fontSize:12, marginTop:8 }}>{customOnlyMode ? `등록된 ${allWords.length}개 단어 검색 가능` : "전체 3,010개 단어 검색 가능"}</div>
            </div>
          ) : results.length === 0 ? (
            <div style={{ textAlign:"center", padding:"60px 20px" }}>
              <div style={{ fontSize:48, marginBottom:16 }}>😅</div>
              <div style={{ color:"rgba(255,255,255,0.2)", fontSize:14, fontWeight:700 }}>"{searchQuery}" 검색 결과가 없어요</div>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:8, paddingTop:8 }}>
              {results.map((word, i) => {
                const isExpanded = expandedCard === word.en + "_search";
                const p = progress.find(p => p.worldId === word.worldId);
                const isMastered = p?.mastered.includes(word.en);
                const isFailed   = p?.failed.includes(word.en);
                const statusIcon = isMastered ? "✅" : isFailed ? "🔴" : "⬜";
                return (
                  <button key={i}
                    onClick={() => setExpandedCard(isExpanded ? null : word.en + "_search")}
                    style={{ background:isExpanded ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)", border:`1px solid ${isExpanded ? word.worldColor+"33" : "rgba(255,255,255,0.06)"}`, borderRadius:14, padding:"12px 14px", textAlign:"left", cursor:"pointer", transition:"all 0.2s" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ fontSize:13 }}>{statusIcon}</span>
                      <span style={{ color:"#fff", fontSize:15, fontWeight:800, flex:1 }}>{word.en}</span>
                      <span style={{ color:"rgba(255,255,255,0.45)", fontSize:13 }}>{word.ko}</span>
                      <span style={{ color:"rgba(255,255,255,0.18)", fontSize:12, marginLeft:4, transform:isExpanded?"rotate(180deg)":"none", transition:"transform 0.2s", display:"inline-block" }}>▼</span>
                    </div>
                    {/* 펼침 */}
                    {isExpanded && (
                      <div style={{ marginTop:12, paddingTop:12, borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
                          <span style={{ fontSize:13 }}>{word.worldEmoji}</span>
                          <span style={{ color:word.worldColor, fontSize:11, fontWeight:700 }}>{word.worldTitle}</span>
                          <span style={{ color:"rgba(255,255,255,0.2)", fontSize:10 }}>WORLD {word.worldId}</span>
                        </div>
                        <div style={{ background:`${word.worldColor}10`, border:`1px solid ${word.worldColor}22`, borderRadius:10, padding:"10px 14px", marginBottom:8 }}>
                          <div style={{ color:"rgba(255,255,255,0.3)", fontSize:9, fontWeight:700, letterSpacing:1, marginBottom:4 }}>한국어 뜻</div>
                          <div style={{ color:"#fff", fontSize:20, fontWeight:900 }}>{word.ko}</div>
                        </div>
                        {word.tip && (
                          <div style={{ background:"rgba(255,184,0,0.07)", border:"1px solid rgba(255,184,0,0.14)", borderRadius:10, padding:"8px 14px" }}>
                            <div style={{ color:"#FFB800", fontSize:11, fontWeight:700 }}>💡 {word.tip}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
              <div style={{ height:20 }} />
            </div>
          )}
        </div>
        <TabBar />
        </div>
      </div>
    );
  }

  // ── 내 단어장 탭 ──────────────────────────
  if (tab === "vocab" && screen === "map") {
    // 필터별 단어 목록
    const displayList = vocabFilter === "mastered" ? allMastered
      : vocabFilter === "failed" ? allFailed
      : allWords;

    // 카테고리(월드)별 그룹핑
    const grouped = targetWorlds.map(world => {
      const p = progress.find(p => p.worldId === world.id);
      const words = world.words
        .filter(word => {
          const isMastered = p?.mastered.includes(word.en);
          const isFailed   = p?.failed.includes(word.en);
          if (vocabFilter === "mastered") return isMastered;
          if (vocabFilter === "failed")   return isFailed;
          return true;
        })
        .map(word => ({
          ...word,
          worldColor: world.color,
          isMastered: p?.mastered.includes(word.en) || false,
          isFailed:   p?.failed.includes(word.en)   || false,
        }));
      return { ...world, filteredWords: words };
    }).filter(g => g.filteredWords.length > 0);

    const filters = [
      { key: "all",      label: "전체",    count: allWords.length,    color: "rgba(255,255,255,0.55)", activeBg: "rgba(255,255,255,0.08)", activeBorder: "rgba(255,255,255,0.2)" },
      { key: "mastered", label: "마스터",   count: allMastered.length, color: "#4ADE80",               activeBg: "rgba(74,222,128,0.12)",  activeBorder: "rgba(74,222,128,0.35)" },
      { key: "failed",   label: "복습필요", count: allFailed.length,   color: "#EF4444",               activeBg: "rgba(239,68,68,0.12)",   activeBorder: "rgba(239,68,68,0.35)"  },
    ];

    return (
      <div style={{ minHeight: "100dvh", background: "#07070f", fontFamily: "'Segoe UI', system-ui, sans-serif", display: "flex", justifyContent: "center" }}>
        <LevelConfirmModal />
        <div style={{ width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", paddingBottom: 80 }}>
        {/* 헤더 */}
        <div style={{ background: "linear-gradient(180deg,#0e0e20 0%,#07070f 100%)" }}>
          <FunUncleBar showLevel={true} />
          <div style={{ padding: "12px 22px 20px" }}>
          <div style={{ color: "#fff", fontSize: 26, fontWeight: 900, marginBottom: 18 }}>
            내 <span style={{ background: "linear-gradient(90deg,#FFB800,#FF6B00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>단어장</span>
          </div>

          {/* 통계 카드 = 필터 버튼 (클릭하면 필터 전환) */}
          <div style={{ display: "flex", gap: 10 }}>
            {filters.map(f => {
              const isActive = vocabFilter === f.key;
              return (
                <button key={f.key} onClick={() => setVocabFilter(f.key)}
                  style={{ flex: 1, background: isActive ? f.activeBg : "rgba(255,255,255,0.03)", border: `1.5px solid ${isActive ? f.activeBorder : "rgba(255,255,255,0.07)"}`, borderRadius: 16, padding: "14px 8px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}>
                  <div style={{ color: isActive ? f.color : "rgba(255,255,255,0.35)", fontSize: 24, fontWeight: 900, lineHeight: 1 }}>{f.count}</div>
                  <div style={{ color: isActive ? f.color : "rgba(255,255,255,0.25)", fontSize: 10, marginTop: 5, fontWeight: 700 }}>{f.label}</div>
                  {isActive && <div style={{ width: 20, height: 2, background: f.color, borderRadius: 2, margin: "6px auto 0" }} />}
                </button>
              );
            })}
          </div>
          </div>
        </div>

        {/* 단어 목록 — 월드별 그룹 헤더 */}
        <div style={{ padding: "0 22px", overflowY: "auto" }}>
          {/* 복습필요 탭 선택 시 전체 복습 시작 버튼 */}
          {vocabFilter === "failed" && allFailed.length > 0 && (
            <button
              onClick={() => {
                // 모든 틀린 단어를 월드 구분 없이 한번에 복습
                // 가장 많이 틀린 월드의 world 객체로 시작
                const worldWithMostFailed = targetWorlds.reduce((acc, w) => {
                  const p = progress.find(p => p.worldId === w.id);
                  const cnt = p ? p.failed.length : 0;
                  return cnt > (progress.find(p => p.worldId === acc.id)?.failed.length || 0) ? w : acc;
                }, targetWorlds[0]);
                // 전체 틀린 단어를 하나의 큰 복습 세트로
                const allFailedWords = targetWorlds.flatMap(w => {
                  const p = progress.find(p => p.worldId === w.id);
                  return (w.words || []).filter(word => p?.failed.includes(word.en));
                });
                setActiveWorld({ ...worldWithMostFailed, unlocked: true, title: "전체 복습", emoji: "🔁" });
                const shuffled = [...allFailedWords].sort(() => Math.random() - 0.5);
                setQueue(shuffled);
                setCardIdx(0); setFlipped(false); setSwipeDir(null); setDragX(0);
                setSessionCorrect(0); setSessionTotal(0); setCombo(0);
                setIsReview(true);
                processingRef.current = false;
                setScreen("game");
              }}
              style={{ width: "100%", padding: "15px", background: "rgba(239,68,68,0.1)", border: "1.5px solid rgba(239,68,68,0.3)", borderRadius: 16, color: "#EF4444", fontSize: 15, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
              🔁 전체 복습 시작
              <span style={{ background: "rgba(239,68,68,0.2)", borderRadius: 20, padding: "2px 10px", fontSize: 13 }}>{allFailed.length}개</span>
            </button>
          )}
          {grouped.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>
                {vocabFilter === "mastered" ? "🌱" : vocabFilter === "failed" ? "🎉" : "📖"}
              </div>
              <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 14, fontWeight: 700 }}>
                {vocabFilter === "mastered" ? "아직 마스터한 단어가 없어요! 게임을 시작해보세요!"
                  : vocabFilter === "failed" ? "틀린 단어가 없어요! 완벽해요 🎉"
                  : "게임을 시작하면 단어가 여기 쌓여요!"}
              </div>
            </div>
          ) : grouped.map(group => (
            <div key={group.id} style={{ marginBottom: 24 }}>
              {/* 월드 그룹 헤더 */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 0 10px" }}>
                <span style={{ fontSize: 16 }}>{group.emoji}</span>
                <span style={{ color: group.color, fontWeight: 800, fontSize: 13 }}>{group.title}</span>
                <div style={{ flex: 1, height: 1, background: `${group.color}25`, marginLeft: 4 }} />
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, fontWeight: 600 }}>{group.filteredWords.length}개</span>
                {/* 그룹 헤더 복습 버튼 — 해당 월드에 틀린 단어 있을 때만 */}
                {(() => {
                  const gp = progress.find(p => p.worldId === group.id);
                  const hasFailed = gp && gp.failed.length > 0;
                  return hasFailed ? (
                    <button onClick={() => startReview({ ...(targetWorlds.find(w2 => w2.id === group.id) || group), unlocked: true })}
                      style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, padding: "3px 10px", color: "#EF4444", fontSize: 10, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}>
                      🔁 {gp.failed.length}개
                    </button>
                  ) : null;
                })()}
              </div>

              {/* 단어 카드 목록 */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {group.filteredWords.map((word, i) => {
                  const isExpanded = expandedCard === word.en;
                  const statusColor = word.isMastered ? "#4ADE80" : word.isFailed ? "#EF4444" : "rgba(255,255,255,0.2)";
                  const statusIcon  = word.isMastered ? "✅" : word.isFailed ? "🔴" : "⬜";
                  return (
                    <button key={`${word.en}-${i}`}
                      onClick={() => setExpandedCard(isExpanded ? null : word.en)}
                      style={{ background: isExpanded ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)", border: `1px solid ${isExpanded ? group.color + "33" : "rgba(255,255,255,0.06)"}`, borderRadius: 14, padding: "12px 14px", textAlign: "left", cursor: "pointer", transition: "all 0.2s" }}>
                      {/* 접힌 상태 */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 13, flexShrink: 0 }}>{statusIcon}</span>
                        <span style={{ color: "#fff", fontSize: 15, fontWeight: 800, flex: 1 }}>{word.en}</span>
                        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{word.ko}</span>
                        <span style={{ color: "rgba(255,255,255,0.18)", fontSize: 12, marginLeft: 4, transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s", display: "inline-block" }}>▼</span>
                      </div>
                      {/* 펼침 상세 */}
                      {isExpanded && (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                          <div style={{ background: `${group.color}10`, border: `1px solid ${group.color}22`, borderRadius: 10, padding: "10px 14px", marginBottom: 8 }}>
                            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>한국어 뜻</div>
                            <div style={{ color: "#fff", fontSize: 20, fontWeight: 900 }}>{word.ko}</div>
                          </div>
                          <div style={{ background: "rgba(255,184,0,0.07)", border: "1px solid rgba(255,184,0,0.14)", borderRadius: 10, padding: "8px 14px" }}>
                            <div style={{ color: "#FFB800", fontSize: 11, fontWeight: 700 }}>💡 {word.tip}</div>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div style={{ height: 20 }} />
        </div>
        <TabBar />
        </div>
      </div>
    );
  }

  // ── 레벨 선택 화면 ───────────────────────
  // 베타 카운트다운 (오늘 2026-06-08 기준 +3개월 = 2026-09-08)
  const BETA_END = new Date("2026-09-08T00:00:00+09:00");
  const betaDiff = Math.max(0, BETA_END.getTime() - Date.now());
  const betaDays = Math.floor(betaDiff / (1000 * 60 * 60 * 24));

  if (screen === "levelselect") return (
    <div style={{ minHeight: "100dvh", background: "#07070f", fontFamily: "'Segoe UI', system-ui, sans-serif", display: "flex", flexDirection: "column", alignItems: "center" }}>

      {/* 베타 배너 */}
      <div style={{ width: "100%", background: "linear-gradient(90deg,#FFB800,#FF6B00)", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flexShrink: 0 }}>
        <span style={{ fontSize: 14 }}>🚨</span>
        <span style={{ color: "#000", fontWeight: 800, fontSize: 13 }}>[베타 기간 한정] 무료 서비스 종료까지</span>
        <span style={{ color: "#000", fontWeight: 900, fontSize: 14, fontVariantNumeric: "tabular-nums" }}>D-{betaDays}</span>
      </div>

      <div style={{ width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 22px 40px", flex: 1 }}>
      {/* 로고 */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <h1 style={{ color: "#fff", fontSize: 36, fontWeight: 900, margin: 0, lineHeight: 1.1 }}>
          영단어<br />
          <span style={{ background: "linear-gradient(90deg,#FFB800,#FF6B00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: 26 }}>플래시카드</span>
        </h1>
        <p style={{ color: "#FFB800", fontSize: 13, marginTop: 12, fontWeight: 700, letterSpacing: 0.5 }}>
          📚 교육부 추천 3,000단어 수록
        </p>
        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, marginTop: 4, fontWeight: 400 }}>
          교육부 고시 제2022-33호 [별책 14] 기준
        </p>
      </div>

      {/* 레벨 선택 카드 */}
      <div style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: 14 }}>
        {/* 참여자 수 */}
        {participantCount !== null && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "rgba(255,184,0,0.08)", border: "1px solid rgba(255,184,0,0.2)", borderRadius: 30, padding: "8px 18px", marginBottom: 16 }}>
            <span style={{ fontSize: 16 }}>👥</span>
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 500 }}>
              오늘 <strong style={{ color: "#FFB800", fontWeight: 800 }}>{participantCount}명</strong>이 학습 중이에요
            </span>
          </div>
        )}

        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: 700, letterSpacing: 2, textAlign: "center", marginBottom: 4 }}>
          어느 레벨부터 시작할까요?
        </div>

                {[
          {
            key: "elementary",
            emoji: "🌱", label: "초등", sublabel: "Elementary",
            desc: "기초 단어부터 차근차근",
            tag: "권장 797단어",
            color: "#4ADE80", dark: "#15803d",
            worldId: 1,
          },
          {
            key: "middle",
            emoji: "📘", label: "중학", sublabel: "Middle School",
            desc: "기본은 알아요! 한 단계 위로",
            tag: "WORLD 9~14 · 1,200단어",
            color: "#60A5FA", dark: "#1d4ed8",
            worldId: 9,
          },
          {
            key: "high",
            emoji: "🏰", label: "고등·수능", sublabel: "High School",
            desc: "심화 어휘 마스터",
            tag: "WORLD 15~19 · 1,010단어",
            color: "#F472B6", dark: "#be185d",
            worldId: 15,
          },
          {
            key: "custom",
            emoji: "✍️", label: "나만의 단어장", sublabel: "Custom",
            desc: "내가 직접 만든 단어장으로 학습",
            tag: "최대 5개 저장",
            color: "#A78BFA", dark: "#6d28d9",
            isCustomBtn: true,
          },
        ].map(lv => (
          <button key={lv.key}
            onClick={() => {
              if (lv.isCustomBtn) {
                setScreen("customVocab");
                return;
              }
              // 비파괴: 진도 초기화 없이 해당 학년만 "열고" 그 위치로 이동
              unlockGradeStart(lv.worldId);
              levelStartWorldRef.current = lv.worldId;
              scrollTargetRef.current = lv.worldId;
              setScrollTrigger(t => t + 1);
              setScreen("map");
              setTab("map");
            }}
            style={{ background: `linear-gradient(135deg,${lv.color}14,${lv.dark}20)`, border: `1.5px solid ${lv.color}40`, borderRadius: 22, padding: "20px 22px", display: "flex", alignItems: "center", gap: 18, cursor: "pointer", textAlign: "left" }}>
            <div style={{ width: 58, height: 58, background: `${lv.color}20`, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>
              {lv.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 3 }}>
                <span style={{ color: "#fff", fontWeight: 900, fontSize: 18 }}>{lv.label}</span>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>{lv.sublabel}</span>
              </div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, marginBottom: 6 }}>{lv.desc}</div>
              <div style={{ display: "inline-block", background: `${lv.color}18`, border: `1px solid ${lv.color}30`, borderRadius: 20, padding: "2px 10px" }}>
                <span style={{ color: lv.color, fontSize: 10, fontWeight: 700 }}>{lv.tag}</span>
              </div>
            </div>
            <div style={{ color: lv.color, fontSize: 20, fontWeight: 700, flexShrink: 0 }}>›</div>
          </button>
        ))}

      </div>

      <div style={{ marginTop: 48, color: "rgba(255,255,255,0.1)", fontSize: 10, textAlign: "center" }}>
        <a href="https://fun.uncledison.com" style={{ color: "#FF8C00", fontWeight: 700, textDecoration: "none" }}>fun.uncledison.com</a>
      </div>
      </div>
    </div>
  );


  // ── 커스텀 단어장 화면 ─────────────────────────────
  if (screen === "customVocab") {
    return (
      <div style={{ minHeight: "100dvh", background: "#07070f", display: "flex", flexDirection: "column", padding: "40px 22px 80px" }}>
        <ResumePromptModal />
        <div style={{ maxWidth: 480, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: 24 }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ color: "#fff", fontSize: 24, margin: 0, fontWeight: 800 }}>나만의 단어장 ✍️</h2>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => window.dispatchEvent(new Event("showFeedback"))} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "8px 12px", borderRadius: 16, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 800, fontSize: 13 }}>💌 피드백</button>
              <button onClick={() => setScreen("levelselect")} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", padding: "8px 16px", borderRadius: 16, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>처음으로</button>
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>나만의 단어장만 쓰기</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>내 단어장과 검색 메뉴에서 등록한 단어만 보여집니다</div>
            </div>
            <button 
              onClick={() => {
                const newVal = !customOnlyMode;
                setCustomOnlyMode(newVal);
                localStorage.setItem('custom_only_mode', newVal ? 'true' : 'false');
              }}
              style={{ width: 50, height: 28, background: customOnlyMode ? "#A78BFA" : "rgba(255,255,255,0.2)", borderRadius: 14, position: "relative", cursor: "pointer", border: "none", transition: "all 0.2s" }}
            >
              <div style={{ width: 22, height: 22, background: "#fff", borderRadius: "50%", position: "absolute", top: 3, left: customOnlyMode ? 25 : 3, transition: "all 0.2s" }} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {customWorlds.map((cw, i) => {
              const rec = customResume[cw.id];
              const total = Array.isArray(rec?.order) ? rec.order.length : cw.words.length;
              const inProgress = rec && Array.isArray(rec.order) && rec.pos > 0 && rec.pos < rec.order.length;
              return (
              <div key={cw.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={() => openCustomWorld(cw)} style={{ flex: 1, padding: "18px 20px", background: "linear-gradient(135deg,#A78BFA14,#6d28d920)", border: "1.5px solid #A78BFA40", borderRadius: 20, textAlign: "left", cursor: "pointer" }}>
                  <div style={{ color: "#fff", fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{cw.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>단어 {cw.words.length}개</span>
                    {inProgress && <span style={{ background: "#A78BFA22", color: "#C4B5FD", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 10 }}>이어하기 {rec.pos}/{total}</span>}
                  </div>
                  {inProgress && (
                    <div style={{ marginTop: 8, height: 5, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.round(rec.pos / total * 100)}%`, background: "linear-gradient(90deg,#6d28d9,#A78BFA)", borderRadius: 3 }} />
                    </div>
                  )}
                </button>
                <button onClick={() => startEditCustom(cw)} aria-label="편집" style={{ padding: "16px 13px", background: "rgba(167,139,250,0.12)", border: "none", borderRadius: 16, color: "#A78BFA", cursor: "pointer", flexShrink: 0, fontSize: 15 }}>✏️</button>
                <button onClick={() => {
                  if(!confirm('정말 삭제하시겠습니까?')) return;
                  const newCw = customWorlds.filter(w => w.id !== cw.id);
                  setCustomWorlds(newCw);
                  localStorage.setItem('custom_worlds', JSON.stringify(newCw));
                  clearCustomResume(cw.id);
                  if (editingId === cw.id) cancelEditCustom();
                }} aria-label="삭제" style={{ padding: "16px 13px", background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 16, color: "#EF4444", cursor: "pointer", flexShrink: 0, fontSize: 15 }}>🗑️</button>
              </div>
              );
            })}
            {customWorlds.length === 0 && (
              <div style={{ color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "40px 0" }}>생성된 단어장이 없습니다.<br/>아래에서 만들어보세요!</div>
            )}
          </div>

          {(editingId !== null || customWorlds.length < 5) ? (
            <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${editingId !== null ? "#A78BFA66" : "rgba(255,255,255,0.08)"}`, borderRadius: 20, padding: 24, marginTop: 12 }}>
              <h3 style={{ color: "#fff", fontSize: 16, margin: "0 0 16px", fontWeight: 700 }}>{editingId !== null ? "✏️ 단어장 편집" : "새 단어장 만들기"}</h3>
              
              <input type="text" placeholder="단어장 이름 (미입력 시 날짜로 저장)" value={customTitle} onChange={e => setCustomTitle(e.target.value)} 
                style={{ width: "100%", padding: "14px 16px", borderRadius: 12, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", marginBottom: 12 }} />
              
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file && (file.name.endsWith('.txt') || file.name.endsWith('.csv'))) {
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                      setCustomInput(prev => prev + (prev ? '\n' : '') + evt.target.result);
                    };
                    reader.readAsText(file);
                  } else {
                    alert('txt 또는 csv 파일만 가능합니다.');
                  }
                }}
              >
                <textarea 
                  placeholder={"sport 스포츠\nmusic 음악\nmovie 영화\ncomputer 컴퓨터\ninternet 인터넷\nremember 기억하다\nunderstand 이해하다\n\n이런식으로 입력하세요"}
                  value={customInput} 
                  onChange={e => setCustomInput(e.target.value)}
                  style={{ width: "100%", height: 220, padding: "16px", borderRadius: 12, background: "rgba(0,0,0,0.3)", border: "1px dashed rgba(255,255,255,0.2)", color: "#fff", marginBottom: 12, resize: "none" }} 
                />
              </div>
              
              <div style={{ marginBottom: 16, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                ※ 텍스트 파일(txt, csv)을 여기에 드래그앤드롭 하면 내용이 자동으로 채워집니다.
              </div>

              <button onClick={() => {
                const words = parseCustomWords(customInput);
                if (words.length === 0) return alert('단어를 입력해주세요.');

                const now = new Date();
                const defaultTitle = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} 단어장`;

                if (editingId !== null) {
                  // 편집 저장: 제목·단어 교체, 진행 북마크 초기화(위치 꼬임 방지)
                  const newWorlds = customWorlds.map(w =>
                    w.id === editingId ? { ...w, title: customTitle || w.title, words } : w
                  );
                  setCustomWorlds(newWorlds);
                  localStorage.setItem('custom_worlds', JSON.stringify(newWorlds));
                  clearCustomResume(editingId);
                  cancelEditCustom();
                  return;
                }

                const newWorld = {
                  id: 1000 + Date.now() % 100000,
                  title: customTitle || defaultTitle,
                  emoji: "📝",
                  color: "#A78BFA", dark: "#6d28d9",
                  desc: "사용자 생성 단어장",
                  words: words,
                  isCustom: true
                };

                const newWorlds = [...customWorlds, newWorld];
                setCustomWorlds(newWorlds);
                localStorage.setItem('custom_worlds', JSON.stringify(newWorlds));
                setCustomInput("");
                setCustomTitle("");
              }} style={{ width: "100%", padding: "16px", background: "#A78BFA", border: "none", borderRadius: 16, color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer" }}>
                {editingId !== null ? "💾 저장하기" : `추가하기 (${customWorlds.length}/5)`}
              </button>
              {editingId !== null && (
                <button onClick={cancelEditCustom} style={{ width: "100%", padding: "13px", marginTop: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, color: "rgba(255,255,255,0.6)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                  취소
                </button>
              )}
            </div>
          ) : (
            <div style={{ color: "#EF4444", textAlign: "center", padding: "20px", background: "rgba(239,68,68,0.1)", borderRadius: 16 }}>
              최대 5개까지만 생성 가능합니다.
            </div>
          )}
        </div>
        <TabBar />
      </div>
    );
  }

  // ── MAP 화면 ─────────────────────────────
  if (screen === "map") return (
    <div style={{ minHeight: "100dvh", background: "#07070f", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <LevelConfirmModal />

      {/* 고정 헤더 */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, display: "flex", justifyContent: "center", background: "#0e0e20", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ width: "100%", maxWidth: 480 }}>
          <FunUncleBar showLevel={true} />
          <div style={{ padding: "8px 22px 12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, fontWeight: 700 }}>다음 레벨</span>
              <span style={{ color: "#FFB800", fontSize: 10, fontWeight: 700 }}>{xpMod}/100</span>
            </div>
            <div style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 5, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${xpMod}%`, background: "linear-gradient(90deg,#FFB800,#FF6B00)", borderRadius: 5, transition: "width 0.5s" }} />
            </div>
          </div>
        </div>
      </div>

      {/* 스크롤 본문 — 헤더 높이(약 110px) + 탭바(80px) 만큼 여백 */}
      <div style={{ maxWidth: 480, margin: "0 auto", paddingTop: 118, paddingBottom: 96 }}>

      {streak > 2 && (
        <div style={{ margin: "0 22px 14px", background: "rgba(255,100,0,0.08)", border: "1px solid rgba(255,100,0,0.18)", borderRadius: 12, padding: "8px 14px", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>🔥</span>
          <span style={{ color: "#FF6B00", fontWeight: 800, fontSize: 12 }}>{streak}연속 정답 스트릭 유지중!</span>
        </div>
      )}

      {/* 월드 카드 */}
      <div style={{ padding: "0 22px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
        {worlds.map((world) => {
          const p          = progress.find(p => p.worldId === world.id);
          const totalStages = getStageCount(world);
          const clearedStages = p?.stageCleared?.filter(Boolean).length || 0;
          const pct        = Math.round(clearedStages / totalStages * 100);
          const locked     = !world.unlocked;
          const wrec       = customResume[world.id];
          const hasWorldResume = !!(wrec && Array.isArray(wrec.order) && wrec.pos > 0 && wrec.pos < wrec.order.length);

          return (
            <div key={world.id} id={`world-card-${world.id}`}
              style={{ background: locked ? "rgba(255,255,255,0.02)" : `linear-gradient(135deg,${world.color}14,${world.dark}20)`, border: `1.5px solid ${locked ? "rgba(255,255,255,0.05)" : world.color + "40"}`, borderRadius: 24, padding: "20px 22px", opacity: locked ? 0.45 : 1, transition: "opacity 0.2s" }}>

              {/* 월드 헤더 */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: locked ? 0 : 14 }}>
                <div style={{ width: 54, height: 54, background: locked ? "rgba(255,255,255,0.04)" : `${world.color}20`, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
                  {locked ? "🔒" : world.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <span style={{ color: locked ? "rgba(255,255,255,0.25)" : "#fff", fontWeight: 800, fontSize: 15 }}>WORLD {world.id}</span>
                    {p?.cleared && <span style={{ background: world.color, color: "#000", fontSize: 9, fontWeight: 900, padding: "2px 8px", borderRadius: 20, letterSpacing: 1 }}>CLEAR ✓</span>}
                    {hasWorldResume && !p?.cleared && <span style={{ background: `${world.color}22`, color: world.color, fontSize: 9, fontWeight: 900, padding: "2px 8px", borderRadius: 20 }}>이어하기</span>}
                  </div>
                  <div style={{ color: locked ? "rgba(255,255,255,0.18)" : world.color, fontWeight: 700, fontSize: 14 }}>{world.title}</div>
                  <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, marginTop: 2 }}>{clearedStages}/{totalStages} 스테이지 클리어</div>
                </div>
                {/* 플레이 버튼 — 북마크 있으면 이어하기, 없으면 첫 미클리어 스테이지 */}
                {!locked && (() => {
                  return (
                    <button
                      onClick={(e) => { e.stopPropagation(); startWorld(world); }}
                      style={{
                        flexShrink: 0, width: 48, height: 48,
                        background: `linear-gradient(135deg,${world.color},${world.dark})`,
                        border: "none", borderRadius: 14, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: `0 4px 14px ${world.color}44`,
                      }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#000">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </button>
                  );
                })()}
              </div>

              {!locked && (
                <>
                  {/* 진행률 바 */}
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, fontWeight: 700 }}>진행률</span>
                    <span style={{ color: world.color, fontSize: 10, fontWeight: 700 }}>{pct}%</span>
                  </div>
                  <div style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 5, overflow: "hidden", marginBottom: 12 }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${world.dark},${world.color})`, borderRadius: 5, transition: "width 0.5s" }} />
                  </div>

                  {/* 스테이지 버튼 그리드 */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: p.failed.length > 0 ? 10 : 0 }}>
                    {Array.from({ length: totalStages }, (_, i) => {
                      const isCleared  = p?.stageCleared?.[i];           // 70% 통과
                      const isDone     = p?.stageDone?.[i];              // 끝까지 풂(점수 무관)
                      const isNext     = !isCleared && (i === 0 || p?.stageCleared?.[i-1]);
                      const stageLocked = !isCleared && !isNext;
                      // 통과(초록 ✓) > 완료했지만 미통과(주황 ✓·다시) > 다음(번호) > 잠금
                      const checkColor = isCleared ? world.color : "#FFB800";
                      const showCheck  = isCleared || (isDone && isNext);
                      return (
                        <button key={i}
                          onClick={(e) => { e.stopPropagation(); if (!stageLocked) startWorld(world, i); }}
                          disabled={stageLocked}
                          title={isDone && !isCleared ? "끝까지 했어요 (70% 미달 — 다시 도전 시 잠금해제)" : undefined}
                          style={{
                            width: 36, height: 36,
                            borderRadius: 10,
                            background: showCheck ? `${checkColor}33`
                              : isNext ? `${world.color}18`
                              : "rgba(255,255,255,0.04)",
                            border: `1.5px solid ${showCheck ? checkColor + "88"
                              : isNext ? world.color + "44"
                              : "rgba(255,255,255,0.07)"}`,
                            color: showCheck ? checkColor
                              : isNext ? "rgba(255,255,255,0.7)"
                              : "rgba(255,255,255,0.2)",
                            fontSize: showCheck ? 14 : 11,
                            fontWeight: 800,
                            cursor: stageLocked ? "not-allowed" : "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                          {showCheck ? "✓" : i + 1}
                        </button>
                      );
                    })}
                  </div>

                  {/* 복습 버튼 */}
                  {p.failed.length > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); startReview(world); }}
                      style={{ width: "100%", padding: "10px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)", borderRadius: 12, color: "#EF4444", fontSize: 12, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      🔁 틀린 단어 복습 <span style={{ background: "rgba(239,68,68,0.2)", borderRadius: 20, padding: "1px 8px" }}>{p.failed.length}개</span>
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: "center", padding: "0 20px 32px", color: "rgba(255,255,255,0.12)", fontSize: 10, lineHeight: 1.8 }}>
        교육부 고시 제2022-33호 [별책 14] 기준<br />
        <a href="https://fun.uncledison.com" style={{ color: "#FF8C00", fontWeight: 700, textDecoration: "none" }}>fun.uncledison.com</a>
      </div>
      </div>
      <TabBar />
    </div>
  );

  // ── GAME 화면 ─────────────────────────────
  if (screen === "game" && card) {
    // 스와이프 상태에서 카드 transform
    const isSwipingRight = (isDragging && dragX > 20) || swipeDir === "right";
    const isSwipingLeft  = (isDragging && dragX < -20) || swipeDir === "left";
    const rotate         = swipeDir
      ? (swipeDir === "right" ? 18 : -18)
      : dragX * 0.06;
    const translateX     = swipeDir
      ? (swipeDir === "right" ? "140%" : "-140%")
      : `${dragX}px`;

    // 오버레이 투명도
    const rightOpacity = swipeDir === "right" ? 0.95
      : (isDragging && dragX > 0) ? swipeProgress * 0.9 : 0;
    const leftOpacity  = swipeDir === "left"  ? 0.95
      : (isDragging && dragX < 0) ? swipeProgress * 0.9 : 0;

    // 아이콘 투명도
    const rightIconOp = isSwipingRight ? 0.15 + swipeProgress * 0.85 : 0.12;
    const leftIconOp  = isSwipingLeft  ? 0.15 + swipeProgress * 0.85 : 0.12;

    const progressPct = (cardIdx / queue.length) * 100;

    return (
      <div
        style={{ minHeight: "100dvh", background: "#07070f", display: "flex", justifyContent: "center", userSelect: "none" }}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <LevelConfirmModal />
        <QuitConfirmModal />
        <style>{`
          @keyframes spkPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.25)} }
          @keyframes spkBarA { 0%,100%{height:5px} 50%{height:17px} }
          @keyframes spkBarB { 0%,100%{height:15px} 50%{height:5px} }
          @keyframes spkBarC { 0%,100%{height:8px} 50%{height:18px} }
        `}</style>
        <div style={{ width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", cursor: isDragging ? "grabbing" : "grab", paddingBottom: 80 }}>
        {/* 상단 */}
        <div style={{ padding: "44px 20px 14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <button onClick={() => { setQuitTarget("map"); setShowQuitConfirm(true); }}
              style={{ background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 12, padding: "8px 14px", color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              🏠 홈
            </button>
            <div style={{ textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <div style={{ color: w.color, fontWeight: 800, fontSize: 13 }}>{w.emoji} {w.title}</div>
                {isReview
                  ? <span style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 20, padding: "1px 8px", color: "#EF4444", fontSize: 10, fontWeight: 800 }}>복습</span>
                  : activeWorld?.isCustom
                    ? <span style={{ background: `${w.color}18`, border: `1px solid ${w.color}33`, borderRadius: 20, padding: "1px 8px", color: w.color, fontSize: 10, fontWeight: 800 }}>📝 내 단어장</span>
                    : <span style={{ background: `${w.color}18`, border: `1px solid ${w.color}33`, borderRadius: 20, padding: "1px 8px", color: w.color, fontSize: 10, fontWeight: 800 }}>스테이지 {activeStage + 1}</span>
                }
              </div>
              <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 11 }}>{cardIdx + 1} / {queue.length}</div>
            </div>
            <div style={{ background: combo >= 3 ? "rgba(255,184,0,0.14)" : "rgba(255,255,255,0.04)", border: `1px solid ${combo >= 3 ? "rgba(255,184,0,0.28)" : "rgba(255,255,255,0.07)"}`, borderRadius: 12, padding: "8px 14px", minWidth: 52, textAlign: "center", transition: "all 0.3s" }}>
              <span style={{ color: combo >= 3 ? "#FFB800" : "rgba(255,255,255,0.25)", fontWeight: 800, fontSize: 13 }}>
                {combo >= 3 ? `🔥${combo}` : `×${combo}`}
              </span>
            </div>
          </div>
          <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progressPct}%`, background: `linear-gradient(90deg,${w.dark},${w.color})`, borderRadius: 4, transition: "width 0.3s" }} />
          </div>
        </div>

        {/* 콤보 팝업 */}
        {comboPopup && (
          <div style={{ position: "fixed", top: "22%", left: "50%", transform: "translateX(-50%)", zIndex: 200, background: "#FFB800", borderRadius: 20, padding: "14px 28px", textAlign: "center", pointerEvents: "none", boxShadow: "0 8px 32px rgba(255,184,0,0.4)" }}>
            <div style={{ color: "#000", fontSize: 20, fontWeight: 900 }}>🔥 {combo}연속 콤보!</div>
            <div style={{ color: "rgba(0,0,0,0.55)", fontSize: 11, fontWeight: 700 }}>보너스 +5 XP!</div>
          </div>
        )}

        {/* 카드 래퍼 */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 22px 20px" }}>
          {/* 카드 */}
          <div
            key={animKey}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onMouseDown={onMouseDown}
            onClick={() => { if (Math.abs(dragX) < 5 && !processingRef.current) setFlipped(f => !f); }}
            style={{
              width: "100%", maxWidth: 340, minHeight: 400,
              position: "relative", borderRadius: 32, overflow: "hidden",
              transform: `translateX(${translateX}) rotate(${rotate}deg)`,
              transition: isDragging ? "none" : swipeDir ? "transform 0.36s cubic-bezier(.4,0,.2,1)" : "transform 0.25s cubic-bezier(.4,0,.2,1)",
              cursor: isDragging ? "grabbing" : "grab",
              flexShrink: 0,
            }}
          >
            {/* 카드 본체 */}
            <div style={{
              width: "100%", height: "100%", minHeight: 400,
              background: flipped
                ? `linear-gradient(160deg, ${w.dark}33, ${w.color}22, #07070f)`
                : "rgba(255,255,255,0.05)",
              border: `1.5px solid ${flipped ? w.color + "44" : "rgba(255,255,255,0.09)"}`,
              borderRadius: 32,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              padding: "36px 28px", gap: 0,
              position: "relative",
              transition: "background 0.3s, border 0.3s",
            }}>

              {/* 좌 아이콘 (몰라요) */}
              <div style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", opacity: leftIconOp, transition: isDragging ? "none" : "opacity 0.2s" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(239,68,68,0.15)", border: "1.5px solid rgba(239,68,68,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 18, color: "#EF4444" }}>✗</span>
                </div>
              </div>

              {/* 우 아이콘 (알아요) */}
              <div style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", opacity: rightIconOp, transition: isDragging ? "none" : "opacity 0.2s" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${w.color}20`, border: `1.5px solid ${w.color}55`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 18, color: w.color }}>✓</span>
                </div>
              </div>

              {/* 앞면 */}
              {!flipped && (
                <>
                  <div style={{ color: "rgba(255,255,255,0.18)", fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 24 }}>ENGLISH</div>
                  <div style={{ color: "#fff", fontSize: card.en.length > 11 ? 32 : card.en.length > 8 ? 38 : 46, fontWeight: 900, textAlign: "center", letterSpacing: 0.5, lineHeight: 1.1, marginBottom: 16 }}>
                    {card.en}
                  </div>
                  {(() => {
                    const speaking = speakingWord === card.en;
                    const onSpeak = (e) => {
                      e.stopPropagation();
                      if (speaking) return;
                      const wd = card.en;
                      setSpeakingWord(wd);
                      Promise.resolve(speak(wd)).finally(() =>
                        setSpeakingWord((cur) => (cur === wd ? null : cur))
                      );
                    };
                    const bar = (anim) => (
                      <i style={{ display: "inline-block", width: 3, height: 6, background: "#fff", borderRadius: 2, animation: `${anim} 0.5s ease-in-out infinite` }} />
                    );
                    return (
                      <button
                        onClick={onSpeak}
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        aria-label="발음 듣기"
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, minWidth: 110, margin: "0 auto 28px", padding: "11px 20px", background: speaking ? w.color : `${w.color}1f`, border: `1.5px solid ${speaking ? w.color : w.color + "55"}`, borderRadius: 999, color: speaking ? "#000" : "#fff", fontSize: 18, fontWeight: 800, cursor: "pointer", transform: speaking ? "scale(1.06)" : "scale(1)", boxShadow: speaking ? `0 0 18px ${w.color}99` : "none", transition: "transform .15s, background .15s, box-shadow .15s" }}>
                        <span style={{ display: "inline-block", animation: speaking ? "spkPulse 0.6s ease-in-out infinite" : "none" }}>🔊</span>
                        {speaking ? (
                          <span style={{ display: "inline-flex", alignItems: "flex-end", gap: 2, height: 18 }}>
                            {bar("spkBarA")}{bar("spkBarB")}{bar("spkBarC")}
                          </span>
                        ) : (
                          <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.65)" }}>발음</span>
                        )}
                      </button>
                    );
                  })()}
                  <div style={{ color: "rgba(255,255,255,0.18)", fontSize: 12, fontWeight: 600 }}>탭해서 뜻 확인 👆</div>
                </>
              )}

              {/* 뒷면 */}
              {flipped && (
                <>
                  {/* 뜻 */}
                  <div style={{ background: `linear-gradient(135deg,${w.dark}88,${w.color}44)`, border: `1px solid ${w.color}44`, borderRadius: 18, padding: "20px 28px", marginBottom: 16, width: "100%", textAlign: "center" }}>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>한국어</div>
                    <div style={{ color: "#fff", fontSize: 32, fontWeight: 900 }}>{card.ko}</div>
                  </div>
                  {/* 암기 팁 — tip 있을 때만 표시 */}
                  {card.tip && (
                    <div style={{ background: "rgba(255,184,0,0.08)", border: "1px solid rgba(255,184,0,0.18)", borderRadius: 14, padding: "10px 18px", width: "100%", textAlign: "center" }}>
                      <div style={{ color: "#FFB800", fontSize: 12, fontWeight: 700 }}>💡 {card.tip}</div>
                    </div>
                  )}
                  <div style={{ color: "rgba(255,255,255,0.18)", fontSize: 11, marginTop: 20, fontWeight: 600 }}>
                    스와이프로 판정하세요
                  </div>
                </>
              )}
            </div>

            {/* 오른쪽 스와이프 오버레이 */}
            <div style={{ position: "absolute", inset: 0, borderRadius: 32, background: `${w.color}`, opacity: rightOpacity, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center", transition: isDragging ? "none" : "opacity 0.2s" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 48 }}>✓</div>
                <div style={{ color: "#000", fontSize: 20, fontWeight: 900, marginTop: 8 }}>알아요!</div>
              </div>
            </div>

            {/* 왼쪽 스와이프 오버레이 */}
            <div style={{ position: "absolute", inset: 0, borderRadius: 32, background: "#EF4444", opacity: leftOpacity, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center", transition: isDragging ? "none" : "opacity 0.2s" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 48 }}>✗</div>
                <div style={{ color: "#fff", fontSize: 20, fontWeight: 900, marginTop: 8 }}>몰라요</div>
              </div>
            </div>
          </div>

          {/* XP 힌트 */}
          <div style={{ marginTop: 20, display: "flex", gap: 20, alignItems: "center" }}>
            <div style={{ color: "rgba(255,255,255,0.18)", fontSize: 12, fontWeight: 600 }}>← 몰라요</div>
            <div style={{ background: "rgba(255,184,0,0.08)", border: "1px solid rgba(255,184,0,0.15)", borderRadius: 10, padding: "4px 14px" }}>
              <span style={{ color: "#FFB800", fontSize: 11, fontWeight: 700 }}>정답 +{XP_CORRECT} XP</span>
            </div>
            <div style={{ color: "rgba(255,255,255,0.18)", fontSize: 12, fontWeight: 600 }}>알아요 →</div>
          </div>
          {activeWorld && !isReview && (
            <button onClick={() => { setQuitTarget("map"); setShowQuitConfirm(true); }}
              style={{ width: "100%", maxWidth: 320, margin: "22px auto 0", display: "block", padding: "15px", background: activeWorld?.isCustom ? "rgba(167,139,250,0.14)" : `${w.color}18`, border: `1.5px solid ${activeWorld?.isCustom ? "#A78BFA55" : w.color + "55"}`, borderRadius: 16, color: activeWorld?.isCustom ? "#C4B5FD" : w.color, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
              📌 오늘은 여기까지
            </button>
          )}
        </div>
        <TabBar />
        </div>
      </div>
    );
  }

  // ── WORLD CLEAR ───────────────────────────
  if (screen === "worldclear") return (
    <div style={{ minHeight: "100dvh", background: "#07070f", display: "flex", justifyContent: "center" }}>
      <LevelConfirmModal />
      <div style={{ width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ textAlign: "center", maxWidth: 360, width: "100%" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <div style={{ color: w.color, fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>{activeWorld?.isCustom ? "단어장 완주!" : `WORLD ${w.id} CLEAR!`}</div>
        <h2 style={{ color: "#fff", fontSize: 30, fontWeight: 900, margin: "0 0 8px" }}>{w.title}<br />클리어!</h2>
        <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, marginBottom: 8 }}>
          {finalTotal}개 중 {finalCorrect}개 정답
        </div>
        <div style={{ color: "#FFB800", fontWeight: 800, fontSize: 15, marginBottom: 32 }}>+{XP_WORLD} XP 보너스 획득!</div>

        {w.id < WORLDS.length && (
          <div style={{ background: `${w.color}12`, border: `1px solid ${w.color}30`, borderRadius: 20, padding: "16px 20px", marginBottom: 24 }}>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginBottom: 6 }}>🔓 다음 월드 해금!</div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>
              WORLD {w.id + 1} — {WORLDS[w.id].title}
            </div>
          </div>
        )}

        {activeWorld?.isCustom ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={() => startCustomWorld(activeWorld, false)}
              style={{ padding: "18px", background: `linear-gradient(135deg,${w.dark},${w.color})`, border: "none", borderRadius: 20, color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer" }}>
              🔄 처음부터 다시
            </button>
            <button onClick={() => setScreen("customVocab")}
              style={{ padding: "18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, color: "rgba(255,255,255,0.55)", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              내 단어장으로
            </button>
          </div>
        ) : (() => {
          const totalStages  = getStageCount(w);
          const nextStage    = activeStage + 1;
          const hasNextStage = nextStage < totalStages;
          const nextWorld    = WORLDS.find(ww => ww.id === w.id + 1);
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {hasNextStage ? (
                <button onClick={() => startWorld({ ...w, unlocked: true }, nextStage)}
                  style={{ padding: "18px", background: `linear-gradient(135deg,${w.dark},${w.color})`, border: "none", borderRadius: 20, color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer" }}>
                  스테이지 {nextStage + 1} 도전! →
                </button>
              ) : nextWorld ? (
                <button onClick={() => startWorld({ ...nextWorld, unlocked: true }, 0)}
                  style={{ padding: "18px", background: `linear-gradient(135deg,${w.dark},${w.color})`, border: "none", borderRadius: 20, color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer" }}>
                  다음 월드 도전! → {nextWorld.emoji}
                </button>
              ) : (
                <div style={{ color: "#FFB800", fontWeight: 800, fontSize: 15, textAlign: "center", padding: "10px" }}>🏆 모든 단어 완료!</div>
              )}
              <button onClick={() => setScreen((typeof w !== "undefined" && w?.isCustom) || activeWorld?.isCustom ? (customOnlyMode ? "customVocab" : "levelselect") : "map")}
                style={{ padding: "18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, color: "rgba(255,255,255,0.55)", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                홈으로
              </button>
            </div>
          );
        })()}
      </div>
      </div>
    </div>
  );

  // ── REVIEW DONE (복습 완료) ──────────────
  if (screen === "reviewdone") {
    const p         = progress.find(p => p.worldId === w.id);
    const allClear  = p.failed.length === 0;
    const rate      = finalTotal > 0 ? Math.round(finalCorrect / finalTotal * 100) : 0;

    return (
      <div style={{ minHeight: "100dvh", background: "#07070f", display: "flex", justifyContent: "center" }}>
        <LevelConfirmModal />
        <div style={{ width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ textAlign: "center", maxWidth: 360, width: "100%" }}>

          {/* 이모지 + 타이틀 */}
          <div style={{ fontSize: 64, marginBottom: 16 }}>
            {allClear ? "🎊" : rate >= 70 ? "💪" : "🔥"}
          </div>
          <div style={{ color: w.color, fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>복습 완료!</div>
          <h2 style={{ color: "#fff", fontSize: 28, fontWeight: 900, margin: "0 0 6px" }}>
            {allClear ? "완벽 마스터!" : rate >= 70 ? "많이 외웠어요!" : "조금만 더!"}
          </h2>
          <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, marginBottom: 28 }}>
            {finalTotal}개 중 {finalCorrect}개 정답
          </div>

          {/* 스코어 카드 */}
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 24, padding: "24px 28px", marginBottom: 20 }}>
            <div style={{ fontSize: 56, fontWeight: 900, color: allClear ? w.color : rate >= 70 ? "#FFB800" : "#EF4444", lineHeight: 1 }}>{rate}%</div>

            {/* 상세 카운트 */}
            <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 16 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ color: w.color, fontSize: 22, fontWeight: 900 }}>{finalCorrect}</div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 2 }}>맞힌 단어</div>
              </div>
              <div style={{ width: 1, background: "rgba(255,255,255,0.08)" }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ color: "#EF4444", fontSize: 22, fontWeight: 900 }}>{finalTotal - finalCorrect}</div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 2 }}>아직 틀린 단어</div>
              </div>
              <div style={{ width: 1, background: "rgba(255,255,255,0.08)" }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ color: "#FFB800", fontSize: 22, fontWeight: 900 }}>+{finalCorrect * XP_CORRECT}</div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 2 }}>XP 획득</div>
              </div>
            </div>

            {/* 남은 틀린 단어 안내 */}
            {p.failed.length > 0 && (
              <div style={{ marginTop: 16, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 12, padding: "10px 14px" }}>
                <div style={{ color: "#EF4444", fontSize: 12, fontWeight: 700 }}>
                  아직 {p.failed.length}개 남았어요 → 다시 복습하면 없어져요!
                </div>
              </div>
            )}
            {allClear && (
              <div style={{ marginTop: 16, background: `${w.color}10`, border: `1px solid ${w.color}25`, borderRadius: 12, padding: "10px 14px" }}>
                <div style={{ color: w.color, fontSize: 12, fontWeight: 700 }}>
                  🎉 틀린 단어를 모두 마스터했어요!
                </div>
              </div>
            )}
          </div>

          {/* 버튼 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* 다음 단계 버튼 — 복습 후에도 바로 이동 가능 */}
            {(() => {
              const nw = WORLDS.find(w2 => w2.id === w.id + 1);
              return nw ? (
                <button onClick={() => startWorld({ ...nw, unlocked: true })}
                  style={{ padding: "18px", background: `linear-gradient(135deg,${w.dark},${w.color})`, border: "none", borderRadius: 18, color: "#fff", fontSize: 17, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  다음 단계 도전! → {nw.emoji}
                </button>
              ) : null;
            })()}
            {p.failed.length > 0 && (
              <button onClick={() => startReview(w)}
                style={{ padding: "16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)", borderRadius: 18, color: "#EF4444", fontSize: 15, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                🔁 한 번 더 복습!
              </button>
            )}
            <button onClick={() => setScreen(activeWorld?.isCustom ? "customVocab" : "map")}
              style={{ padding: "16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, color: "rgba(255,255,255,0.35)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              {activeWorld?.isCustom ? "내 단어장으로" : "홈으로"}
            </button>
          </div>

          <div style={{ marginTop: 24, color: "rgba(255,184,0,0.25)", fontSize: 10 }}>
            교육부 고시 제2022-33호 [별책 14] · <a href="https://fun.uncledison.com" style={{ color: "#FF8C00", fontWeight: 700, textDecoration: "none" }}>fun.uncledison.com</a>
          </div>
        </div>
        </div>
      </div>
    );
  }

  // ── RESULT (실패) ─────────────────────────
  if (screen === "result") {
    const rate = finalTotal > 0 ? Math.round(finalCorrect / finalTotal * 100) : 0;
    const p    = progress.find(p => p.worldId === w.id);
    return (
      <div style={{ minHeight: "100dvh", background: "#07070f", display: "flex", justifyContent: "center" }}>
        <LevelConfirmModal />
        <div style={{ width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ textAlign: "center", maxWidth: 360, width: "100%" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>💪</div>
          <h2 style={{ color: "#fff", fontSize: 28, fontWeight: 900, margin: "0 0 6px" }}>다시 도전!</h2>
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, marginBottom: 28 }}>클리어 조건: 70% 이상 정답</div>
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 24, padding: "28px", marginBottom: 20 }}>
            <div style={{ fontSize: 60, fontWeight: 900, color: "#EF4444", lineHeight: 1 }}>{rate}%</div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 14, marginTop: 8 }}>{finalTotal}개 중 {finalCorrect}개 정답</div>
            {p.failed.length > 0 && (
              <div style={{ marginTop: 10, color: "#EF4444", fontSize: 12, fontWeight: 600 }}>
                틀린 단어 {p.failed.length}개 → 다음엔 먼저 나와요!
              </div>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* 다음 단계 버튼 — 최우선 */}
            {(() => {
              const nw = WORLDS.find(w2 => w2.id === w.id + 1);
              return nw ? (
                <button onClick={() => startWorld({ ...nw, unlocked: true })}
                  style={{ padding: "18px", background: `linear-gradient(135deg,${w.dark},${w.color})`, border: "none", borderRadius: 18, color: "#fff", fontSize: 17, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  다음 단계 도전! → {nw.emoji}
                </button>
              ) : null;
            })()}
            {/* 커스텀 세트 다시 도전 */}
            {activeWorld?.isCustom && (
              <button onClick={() => startCustomWorld(activeWorld, false)}
                style={{ padding: "18px", background: `linear-gradient(135deg,${w.dark},${w.color})`, border: "none", borderRadius: 18, color: "#fff", fontSize: 17, fontWeight: 900, cursor: "pointer" }}>
                🔄 다시 도전
              </button>
            )}
            {/* 틀린 단어 복습 */}
            {p.failed.length > 0 && (
              <button onClick={() => startReview(w)}
                style={{ padding: "16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)", borderRadius: 18, color: "#EF4444", fontSize: 15, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                🔁 틀린 단어 복습 <span style={{ background: "rgba(239,68,68,0.18)", borderRadius: 20, padding: "1px 8px", fontSize: 12 }}>{p.failed.length}개</span>
              </button>
            )}
            <button onClick={() => setScreen(activeWorld?.isCustom ? "customVocab" : "map")}
              style={{ padding: "16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, color: "rgba(255,255,255,0.35)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              {activeWorld?.isCustom ? "내 단어장으로" : "홈으로"}
            </button>
          </div>
          <div style={{ marginTop: 24, color: "rgba(255,184,0,0.25)", fontSize: 10 }}>
            교육부 고시 제2022-33호 [별책 14] · <a href="https://fun.uncledison.com" style={{ color: "#FF8C00", fontWeight: 700, textDecoration: "none" }}>fun.uncledison.com</a>
          </div>
        </div>
        </div>
      </div>
    );
  }

  return null;
}

