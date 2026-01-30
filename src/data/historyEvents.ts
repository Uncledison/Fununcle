export interface HistoryEvent {
    year: number;
    month?: number;
    title: string;
    emoji: string;
    description: string;
    category: 'tech' | 'science' | 'general' | 'life' | 'earth' | 'cosmic' | 'human';
}

export const historyEvents: HistoryEvent[] = [
    // --- 8. 21세기 디지털 혁명과 생성형 AI의 시대 (2006 ~ 2025) ---
    // 8.2 생성형 AI 서비스와 멀티모달 혁명
    { year: 2025, title: "에이전틱 AI 보편화", emoji: "AGENTIC_AI", description: "목표를 자율 계획·실행하는 AI 에이전트 확산.", category: "tech" },
    { year: 2024, title: "Kling AI 베타 출시", emoji: "KLING_LOGO", description: "Kuaishou, 물리적 일관성을 갖춘 영상 생성 AI.", category: "tech" },
    { year: 2024, title: "Hailuo AI 출시", emoji: "HAILUO_LOGO", description: "MiniMax, 텍스트·음악 생성 멀티모달 플랫폼.", category: "tech" },
    { year: 2024, title: "Sora(소라) 공개", emoji: "SORA_LOGO", description: "OpenAI, 텍스트로 1분 고화질 영상 생성.", category: "tech" },
    { year: 2024, title: "Gemini 2.0 발표", emoji: "GEMINI_LOGO", description: "Google, 추론·행동하는 에이전트 모델 가시화.", category: "tech" },
    { year: 2023, title: "Grok 출시", emoji: "GROK_LOGO", description: "xAI, X 데이터 기반 실시간 정보 AI.", category: "tech" },
    { year: 2023, title: "Claude 출시", emoji: "CLAUDE_LOGO", description: "Anthropic, 안전 최우선 헌법적 AI 모델.", category: "tech" },
    { year: 2022, title: "ChatGPT 출시", emoji: "CHATGPT_LOGO", description: "OpenAI, 생성형 AI 대중화의 시작.", category: "tech" },
    { year: 2022, title: "Perplexity AI 설립", emoji: "PERPLEXITY_LOGO", description: "실시간 검색과 결합된 대화형 답변 엔진.", category: "tech" },
    { year: 2022, title: "ElevenLabs 설립", emoji: "ELEVENLABS_LOGO", description: "초실감 AI 음성 합성 및 클로닝 기술.", category: "tech" },
    { year: 2022, title: "Midjourney v1 출시", emoji: "MIDJOURNEY_LOGO", description: "예술적 이미지 생성 AI 시대 개막.", category: "tech" },
    { year: 2022, title: "누리호(KSLV-II) 성공", emoji: "NURIHO", description: "한국 독자 기술로 우주 자립 실현.", category: "cosmic" },

    // 8.1 모바일 및 혁신 도구의 등장
    { year: 2020, title: "Gamma 창립", emoji: "GAMMA_LOGO", description: "AI 기반 시각적 스토리텔링 도구.", category: "tech" },
    { year: 2019, title: "갤럭시 폴드 출시", emoji: "GALAXY_FOLD", description: "삼성전자, 세계 최초 폴더블 폰 상용화.", category: "tech" },
    { year: 2015, title: "팰컨 9 수직 착륙", emoji: "FALCON9", description: "SpaceX, 로켓 재사용 시대를 열다.", category: "cosmic" },
    { year: 2014, title: "다음-카카오 합병", emoji: "DAUM_KAKAO_MERGER", description: "국내 최대 모바일 플랫폼 기업 탄생.", category: "tech" },
    { year: 2013, title: "SK하이닉스 HBM 개발", emoji: "SK_HBM", description: "세계 최초 HBM 개발, AI 핵심 메모리 선점.", category: "tech" },
    { year: 2013, title: "나로호(KSLV-I) 성공", emoji: "NAROHO", description: "우리 땅에서 쏘아 올린 첫 우주 발사체.", category: "cosmic" },
    { year: 2010, title: "갤럭시 S 출시", emoji: "GALAXY_S", description: "삼성, 글로벌 스마트폰 시장 리더십 확보.", category: "tech" },
    { year: 2010, title: "카카오톡 오픈", emoji: "KAKAO_TALK", description: "한국 모바일 메신저의 표준 정립.", category: "tech" },
    { year: 2007, title: "아이폰(iPhone) 출시", emoji: "IPHONE_LOGO", description: "애플, 전 지구적 모바일 생태계 구축.", category: "tech" },
    { year: 2006, title: "아이위랩(카카오) 설립", emoji: "KAKAO_CORP", description: "김범수, 모바일 개척자로 변신하다.", category: "tech" },
    { year: 2003, title: "테슬라 설립", emoji: "TESLA", description: "전기차 혁명의 시작.", category: "tech" },
    { year: 2002, title: "스페이스X 설립", emoji: "SPACEX", description: "일론 머스크, 화성 식민지 건설을 향한 도전.", category: "cosmic" },

    // --- 7. 글로벌 빅테크와 한국 인터넷 혁명 (1990 ~ 1999) ---
    { year: 1999, title: "다음(Daum) 포털 개편", emoji: "DAUM", description: "커뮤니티·메일 결합 종합 포털 도약.", category: "tech" },
    { year: 1999, title: "네이버(NAVER) 설립", emoji: "N", description: "NHN 출범, 검색 중심 포털 혁명.", category: "tech" },
    { year: 1999, title: "아리랑 1호 발사", emoji: "ARIRANG1", description: "한국 최초의 다목적 실용 위성.", category: "cosmic" },
    { year: 1998, title: "리니지 출시", emoji: "LINEAGE", description: "한국형 PC방 문화와 온라인 게임 붐 주도.", category: "tech" },
    { year: 1997, title: "한메일 서비스 오픈", emoji: "HANMAIL", description: "다음, 전 국민 이메일 시대를 열다.", category: "tech" },
    { year: 1997, title: "엔씨소프트 설립", emoji: "NCSOFT", description: "김택진, MMORPG 명가의 기틀 마련.", category: "tech" },
    { year: 1996, title: "바람의 나라 출시", emoji: "BARAM_OF_THE_WIND", description: "세계 최초 그래픽 MMORPG (넥슨).", category: "tech" },
    { year: 1995, title: "다음커뮤니케이션 설립", emoji: "DAUM_COMM", description: "이재웅, 한국 포털 서비스의 선구자.", category: "tech" },
    { year: 1994, title: "넥슨(NEXON) 설립", emoji: "NEXON", description: "김정주, 한국 온라인 게임 산업의 효시.", category: "tech" },
    { year: 1993, title: "엔비디아(NVIDIA) 창립", emoji: "NVIDIA", description: "젠슨 황, GPU의 시대를 열다.", category: "tech" },
    { year: 1993, title: "KSR-I 발사", emoji: "KSR1", description: "한국형 과학로켓 1호, 로켓 개발 시초.", category: "cosmic" },
    { year: 1992, title: "우리별 1호 발사", emoji: "URIBYEOL1", description: "KAIST, 한국 최초의 인공위성.", category: "cosmic" },

    // --- 6. 한국의 산업 기적과 글로벌 기업 (1950 ~ 1989) ---
    { year: 1983, title: "삼성 64K DRAM 개발", emoji: "SAMSUNG_DRAM", description: "한국 반도체 신화의 시작.", category: "tech" },
    { year: 1976, title: "애플(Apple) 창립", emoji: "APPLE", description: "스티브 잡스와 워즈니악.", category: "tech" },
    { year: 1975, title: "현대 포니 출시", emoji: "HYUNDAI_PONY", description: "한국 최초의 독자 고유 모델 자동차.", category: "tech" },
    { year: 1975, title: "마이크로소프트 창립", emoji: "MICROSOFT_LOGO", description: "빌 게이츠, 소프트웨어 제국을 건설하다.", category: "tech" },
    { year: 1972, title: "현대조선소 기공", emoji: "HYUNDAI_SHIPYARD", description: "울산 미포만에서 시작된 조선 강국의 꿈.", category: "tech" },
    { year: 1969, title: "아폴로 11호 달 착륙", emoji: "APOLLO11", description: "닐 암스트롱, 인류 최초로 달을 밟다.", category: "cosmic" },
    { year: 1968, title: "포항종합제철(POSCO)", emoji: "POSCO_LOGO", description: "박태준, '철강은 국력'을 실현하다.", category: "tech" },
    { year: 1958, title: "NASA 설립", emoji: "NASA_LOGO", description: "미국 항공우주국, 인류 우주 탐사의 중추.", category: "cosmic" },
    { year: 1953, title: "선경직물(SK) 설립", emoji: "SK_VINTAGE", description: "SK그룹 모태, 섬유에서 에너지/통신으로.", category: "tech" },

    // --- 5. 산업 혁명과 기업의 탄생 (1750 ~ 1950) ---
    { year: 1947, title: "락희화학공업사(LG)", emoji: "LUCKY_VINTAGE", description: "한국 화학 산업의 개척 (LG화학 모태).", category: "tech" },
    { year: 1947, title: "현대토건사 설립", emoji: "HYUNDAI_TOGEON", description: "정주영, 한국 인프라 건설의 주역.", category: "tech" },
    { year: 1938, title: "삼성상회 설립", emoji: "SAMSUNG_SANGHOE", description: "이병철, 삼성그룹의 모태 설립.", category: "tech" },
    { year: 1908, title: "포드 모델 T", emoji: "FORD_MODEL_T", description: "헨리 포드, 자동차 대량 생산 혁명.", category: "tech" },
    { year: 1885, title: "휘발유 자동차", emoji: "BENZ_MOTORWAGEN", description: "칼 벤츠, 현대적 운송 수단의 탄생.", category: "tech" },
    { year: 1879, title: "전구 발명", emoji: "LIGHT_BULB", description: "토마스 에디슨, 전기 문명의 상징.", category: "tech" },
    { year: 1876, title: "전화기 특허", emoji: "TELEPHONE", description: "알렉산더 그레이엄 벨, 음성 통신의 시작.", category: "tech" },
    { year: 1769, title: "증기 기관 개량", emoji: "STEAM_ENGINE", description: "제임스 와트, 에너지 혁명과 산업 혁명.", category: "tech" },

    // --- 3. 한국의 전통 과학과 인류의 기원 (BC ~ 1700) ---
    { year: 1443, title: "훈민정음 창제", emoji: "HUNMINJEONGEUM", description: "세종대왕, 세계 유일의 과학적 원리 문자.", category: "science" },
    { year: 1441, title: "측우기 발명", emoji: "CHEUGUGI", description: "장영실, 세계 최초의 우량계.", category: "tech" },
    { year: 1434, title: "자격루 제작", emoji: "JAGYEONGNU", description: "장영실, 물의 압력을 이용한 자동 물시계.", category: "tech" },
    { year: 1377, title: "화통도감 설치", emoji: "HWATONG_DOGAM", description: "최무선, 왜구를 격퇴하기 위한 화포 개발.", category: "tech" },
    { year: -3500, title: "바퀴의 발명", emoji: "WHEEL", description: "이동과 물류의 혁명.", category: "tech" },
    { year: -10000, title: "신석기 혁명", emoji: "🌾", description: "농경 생활의 시작.", category: "general" },
    { year: -3300000, title: "최초의 석기 도구", emoji: "🪨", description: "인류, 도구를 사용하기 시작하다.", category: "human" },

    // --- 2. 현생누대: 생명의 역사 (541 Ma ~ ) ---
    { year: -66000000, title: "K-Pg 대멸종", emoji: "☄️", description: "소행성 충돌로 공룡 시대 종결, 포유류의 시대.", category: "earth" },
    { year: -201000000, title: "쥬라기 시대", emoji: "🦕", description: "거대 공룡의 황금기.", category: "life" },
    { year: -251000000, title: "트라이아스기", emoji: "🦖", description: "공룡과 포유류 조상의 등장.", category: "life" },
    { year: -252000000, title: "제3차 대멸종", emoji: "☠️", description: "지구 생명체의 95% 이상 절멸 (페름기 말).", category: "earth" },
    { year: -443000000, title: "최초의 육상 생물", emoji: "🦎", description: "오존층 형성으로 생명체가 육지로 진출하다.", category: "life" },
    { year: -541000000, title: "캄브리아기 대폭발", emoji: "💥", description: "생물 종의 다양성이 폭발적으로 증가하다.", category: "life" },

    // --- 1. 우주와 지구의 탄생 (13.8 Ga ~ ) ---
    { year: -1500000000, title: "산소 축적", emoji: "💨", description: "대기 중 자유 산소(O2)가 축적되기 시작하다.", category: "earth" },
    { year: -3400000000, title: "산소 발생 광합성", emoji: "🍃", description: "남세균이 산소를 만들어내다.", category: "life" },
    { year: -3850000000, title: "최초의 생명", emoji: "🦠", description: "심해 열수구에서 단세포 생명체 출현.", category: "life" },
    { year: -4400000000, title: "최초의 바다", emoji: "🌊", description: "수증기가 응결되어 거대한 바다를 이루다.", category: "earth" },
    { year: -4500000000, title: "달의 형성", emoji: "🌑", description: "거대 충돌 가설 (테이아).", category: "cosmic" },
    { year: -4600000000, title: "지구 탄생", emoji: "🌍", description: "태양계의 3번째 행성으로 지구가 태어나다.", category: "earth" },
    { year: -13800000000, title: "빅뱅 (Big Bang)", emoji: "🌌", description: "우주의 탄생과 팽창 시작.", category: "cosmic" },
];
