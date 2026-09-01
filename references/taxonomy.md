# 레이아웃 택소노미

> 에디토리얼 기본 원리, 웹 UX·UI 아키타입, 현대 실험 레이아웃까지. 기획과 UX 의도에 맞는 레이아웃 패턴을 도출하는 분류 체계입니다.

**6 Parts · 23 Categories · 139+ Keywords**

## Part 1: 기초 원리

도구·화면과 무관하게 적용되는 레이아웃의 문법 (38개 키워드)

### 1. Grid Systems · 그리드 시스템

콘텐츠를 배치하는 구조적 골격. 모든 레이아웃 판단의 기준선이 된다.

| ID | Pattern | 한글 | Aliases | Maturity | Sizing | Evidence | Description | Best For | Structure | Line Length | Prompt Example | Build | Components | Good With | Avoid With |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| manuscript-grid | Manuscript Grid | 원고 그리드 |  | foundational | fixed | standard | 본문을 한 컬럼으로만 흐르게 하고 좌우 여백을 둔 타입 영역. h1·p 가 글의 의미를 정한다면, 이건 그 글이 차지하는 폭과 위치를 정하는 레이아웃 결정. 폭을 45-75자로 제한해 가독성을 만든다. | 롱폼 본문, 전자책, 읽기 전용 화면 | 1 column | 45-75ch |  | CSS / max-width:65ch / margin:auto | Container, Paragraph, Heading | Vertical Rhythm, Baseline Grid | Dashboard/Analytics Grid |
| column-grid | Column Grid | 컬럼 그리드 | Multi-column Grid, 다단 그리드 | foundational |  | standard | 화면 폭을 같은 너비의 수직 컬럼으로 나누고 그 선에 맞춰 콘텐츠를 정렬하는 기본 골격. flex 로 적당히 나누는 것과 달리, 정해진 컬럼과 거터를 기준 삼아 모든 요소의 시작·끝을 맞춘다. 대부분의 웹 페이지 본문 구획에 쓴다. | 대부분의 웹 페이지 본문 구획 | 2-6 columns |  | 본문은 6컬럼 그리드, 거터 24px | CSS Grid / grid-template-columns / gap |  | Modular Grid, Margin & Gutter |  |
| modular-grid | Modular Grid | 모듈러 그리드 |  | foundational |  | standard | 컬럼과 행이 교차해 균일한 모듈(셀)을 만드는 격자로, 가로뿐 아니라 세로 정렬선까지 고정한다. 카드를 flex 로 줄바꿈만 시키면 행 높이가 제각각이지만, 이건 행·열을 함께 묶어 타일을 격자에 가둔다. 카드 갤러리나 제품 목록에 쓴다. | 카드 갤러리, 제품 목록, 균질한 타일 배치 | cols × rows cells |  |  | CSS Grid / grid-template-columns / grid-auto-rows / gap |  | Card Grid, Bento Grid, Aspect-ratio Grid |  |
| hierarchical-grid | Hierarchical Grid | 위계 그리드 |  | foundational |  | standard | 균일 격자를 깨고 콘텐츠 중요도에 맞춰 셀 크기·위치를 불규칙하게 변형한 그리드. 모든 칸을 같은 크기로 두는 모듈러 그리드와 달리, 핵심 항목에 더 넓은 영역을 배정해 위계를 만든다. 매거진이나 비대칭 강조가 필요한 에디토리얼에 쓴다. | 매거진, 비대칭 강조가 필요한 에디토리얼 |  |  |  | CSS Grid / grid-template-areas / Subgrid |  | Magazine Layout, Asymmetric Balance |  |
| baseline-grid | Baseline Grid | 베이스라인 그리드 |  | foundational |  | standard | 모든 줄의 밑선을 공통 가로 격자에 맞춰 세로 리듬을 통일하는 체계. p·h1 의 기본 줄간격은 제각각이지만, 이건 line-height 와 여백을 한 단위(예 8px)의 배수로 묶어 줄을 가로로 정렬한다. 인쇄에서 엄격, 웹에선 Vertical Rhythm 으로 근사. | 다단 본문의 줄 정렬, 인쇄 수준 타이포 |  | 45-75ch |  | CSS / line-height (8px 배수) | Paragraph, Heading | Vertical Rhythm, Manuscript Grid |  |
| compound-grid | Compound Grid | 복합 그리드 |  | emerging |  | standard | 컬럼 수가 다른 둘 이상의 그리드를 같은 면에 겹쳐 쓰는 복합 구조. 12컬럼 한 종류만 쓰는 단일 그리드와 달리, 2단·3단 리듬을 한 페이지에서 번갈아 써 변화를 만든다. 리듬 변화가 필요한 고급 에디토리얼에 쓴다. | 리듬 변화를 주는 고급 에디토리얼 |  |  |  | CSS Grid / grid-template-columns / Subgrid |  | Magazine Layout | Centered Form |
| twelve-column | 12-Column System | 12컬럼 시스템 | 12-col Grid, Bootstrap Grid, 반응형 그리드 | mainstream |  | standard | 화면을 12등분해 4·6·8 등 약수 조합으로 폭을 자유롭게 떼어 쓰는 표준 웹 그리드. 컬럼 수를 그때그때 정하는 방식과 달리, 12라는 공통 분모로 브레이크포인트마다 같은 규칙으로 폭을 재배분한다. 반응형 웹 전반의 기본 그리드로 쓴다. | 반응형 웹 전반, 디자인 시스템 기본 그리드 | 12 cols (Material: 4/8/12) |  | 12컬럼 기준, 카드는 md에서 4컬럼 차지 | CSS Grid / repeat(12, 1fr) / grid-column: span |  | Card Grid, Holy Grail Layout |  |
| swiss-grid | Swiss / International Grid | 스위스 그리드 | International Typographic Style, 스위스 스타일 | foundational |  | standard | 엄격한 격자 정렬에 좌측 정렬·비대칭 배치를 더한 정통 타이포 그리드. 중앙 정렬로 무난하게 채우는 것과 달리, 모든 요소를 격자선에 칼같이 붙이고 의도적 비대칭으로 긴장을 만든다. 정보 밀도 높은 아카이브나 미니멀 브랜드에 쓴다. | 정보 밀도 높은 아카이브, 미니멀 브랜드 |  |  |  | CSS Grid / grid-template-areas / align-items: start |  | Modular Grid, Asymmetric Balance |  |

### 2. Proportion & Balance · 비율·균형

요소 간 크기와 무게를 정하는 비례 규칙. 안정감과 긴장감을 조율한다.

| ID | Pattern | 한글 | Aliases | Maturity | Evidence | Description | Best For | Avoid For | Reflow | Prompt Example | Build | Components | Good With | Avoid With |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| rule-of-thirds | Rule of Thirds | 삼분할 |  | foundational | standard | 화면을 가로·세로 3등분한 4개 교차점에 핵심 요소를 두는 구도 규칙. 무조건 정중앙에 두는 것과 달리, 초점을 살짝 비껴 놓아 긴장과 여백을 함께 만든다. 히어로 비주얼이나 이미지 중심 배치에 쓴다. | 히어로 비주얼, 이미지 중심 배치 | 데이터 밀도 높은 표·대시보드처럼 정렬 격자가 우선인 화면 | Stack |  | CSS Grid / repeat(3, 1fr) | FullBleed, Image, Hero + 스크롤 | Focal Point, Full-bleed Hero |  |
| golden-ratio | Golden Ratio | 황금비 | Golden Section, 1.618 | foundational | standard | 약 1:1.618 비례로 영역을 가르는 고전 분할 규칙. 좌우를 반반(50:50)으로 나누는 것과 달리, 한쪽을 1.618배 넓혀 안정감 있는 위계를 만든다. 본문·사이드바 폭 비율이나 조화로운 분할에 쓴다. | 본문/사이드바 폭 비율, 조화로운 분할 | 균등 분할이 더 자연스러운 좌우 대등 비교 화면 | Stack |  | grid-template-columns: 1.618fr 1fr / Flexbox | Sidebar, Container, Asymmetric Split | Sidebar + Content |  |
| modular-scale | Modular Scale | 모듈러 스케일 |  | mainstream | standard | 고정 비율(예 1.25배)로 한 단계씩 커지는 크기 체계. 제목 크기를 눈대중으로 28·22·17처럼 임의로 정하는 것과 달리, 한 비율을 곱해 단계를 도출하므로 위계가 수학적으로 일관된다. 타이포·간격 스케일 설계에 쓴다. | 타이포·간격 스케일, 일관된 위계 | 모든 텍스트를 같은 크기로 두는 데이터 표·코드 블록 | Stack | 1.25배 모듈러 스케일로 제목 크기 단계 구성 | clamp() / calc() / CSS custom properties | Heading, Fluid Typography (clamp), Typography | Scale Contrast, Vertical Rhythm |  |
| symmetric-balance | Symmetric Balance | 대칭 균형 |  | foundational | standard | 중심축을 기준으로 좌우(또는 상하)가 거울처럼 대등한 배치. 무게를 비대칭으로 분산하는 것과 달리, 양쪽을 같은 비중으로 맞춰 정적이고 안정된 인상을 준다. 신뢰감이 필요한 랜딩이나 중앙 정렬 폼에 쓴다. | 신뢰감이 필요한 랜딩, 중앙 정렬 폼 | 동적인 시선 유도가 필요한 비대칭 에디토리얼 | Stack |  | Flexbox / justify-content: center / margin: auto | SplitScreen, Form, Container | Centered Hero, Centered Form | Asymmetric Layout |
| asymmetric-balance | Asymmetric Balance | 비대칭 균형 |  | mainstream | standard | 크기·무게가 다른 요소를 여백과 위치로 시각적 균형을 맞춘 배치. 좌우를 똑같이 맞추는 대칭과 달리, 큰 요소 반대편에 작은 요소와 여백을 배치해 균형은 잡되 동적인 시선 흐름을 만든다. 현대적 인상과 시선 유도가 필요할 때 쓴다. | 동적이고 현대적인 인상, 시선 유도 | 좌우 대등함으로 신뢰감을 줘야 하는 중앙 정렬 폼 | Stack |  | CSS Grid / grid-template-areas / Flexbox | Asymmetric Split, BentoGrid, OffsetLayout | Split Hero (Text/Visual), Hierarchical Grid |  |
| optical-balance | Optical Balance | 시각적 균형 |  | foundational | standard | 수치상 가운데가 아니라 지각상 가운데에 맞춰 위치·여백을 미세 보정하는 정렬. 정확히 중앙값으로만 배치하면 둥근 형태나 재생 아이콘은 한쪽으로 쏠려 보이는데, 이를 눈에 맞게 살짝 옮긴다. 로고·아이콘 정렬이나 버튼 내부 광학 보정에 쓴다. | 로고·아이콘 정렬, 버튼 내부 광학 보정 | 수치 정렬만으로 충분한 균질 격자 배치 | Stack |  | transform: translate / 비대칭 padding / margin 미세 조정 | IconButton, Button, Avatar | Symmetric Balance |  |
| van-de-graaf-canon | Van de Graaf Canon | 반더그라프 캐논 |  | foundational | standard | 지면을 대각선으로 분할해 안쪽·바깥 여백 비례를 도출하는 고전 서적 페이지 캐논. 여백을 사방 같은 값으로 두는 것과 달리, 바깥과 아래를 더 넓혀 책 펼침면의 전통 비례를 재현한다. 인쇄 지향 레이아웃이나 책 형식 페이지에 쓴다. | 인쇄 지향 레이아웃, 책 형식 페이지 | 여백을 최소화하는 정보 밀집형 웹 대시보드 | Stack |  | grid-template-columns / 비대칭 padding / max-width | Container, Paragraph, Single Column | Manuscript Grid, Macro/Micro Whitespace |  |
| aspect-ratio-discipline | Aspect-ratio Discipline | 비율 규율 |  | mainstream | standard | 미디어·카드의 종횡비를 한 값으로 고정해 행 정렬과 로딩 안정성을 지키는 규칙. 이미지 원본 비율을 그대로 두면 행 높이가 들쭉날쭉하고 레이아웃이 밀리지만, 비율을 고정하면 격자가 흔들리지 않는다. 갤러리·썸네일 그리드와 CLS 방지에 쓴다. | 갤러리, 썸네일 그리드, CLS 방지 | 높이가 콘텐츠마다 달라야 하는 핀터레스트형 가변 갤러리 | Reflow-Heavy | 카드 미디어는 모두 16:9 고정 | aspect-ratio / object-fit: cover | AspectRatio, Card Grid, MediaCard | Card Grid, Aspect-ratio Grid |  |

### 3. Visual Hierarchy · 시각 위계

무엇을 먼저 보게 할지 정하는 우선순위 장치. 시선의 순서를 설계한다.

| ID | Pattern | 한글 | Aliases | Maturity | Evidence | Description | Best For | Avoid For | Reflow | Build | Components | Good With | Avoid With |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| scale-contrast | Scale Contrast | 크기 대비 |  | foundational | standard | 요소 간 크기 차이로 무엇을 먼저 볼지 정하는 가장 강한 위계 신호. 제목·본문을 비슷한 크기로 두면 시선 순서가 안 생기지만, 크기를 크게 벌리면 큰 쪽이 먼저 읽힌다. 히어로 헤드라인이나 핵심 지표 강조에 쓴다. | 히어로 헤드라인, 핵심 지표 강조 | 모든 항목이 동등하게 읽혀야 하는 균질 목록 | Stack | clamp() / font-size 스케일 | Oversized Display, Heading, Statistic | Oversized/Full-bleed Type, Modular Scale |  |
| weight-contrast | Weight Contrast | 굵기 대비 |  | foundational | standard | 글자 굵기·농도 차이로 같은 크기 안에서 강약을 만드는 위계. 모든 텍스트를 한 굵기로 두면 평평하게 읽히지만, 제목을 굵게 본문을 보통으로 두면 위계가 생긴다. 제목·본문 구분이나 라벨 강조에 쓴다. | 제목/본문 구분, 라벨 강조 | 굵기 단계가 한 종류뿐인 단일 폰트웨이트 화면 | Stack | font-weight / opacity | Heading, Paragraph, Label | Scale Contrast |  |
| spatial-grouping | Spatial Grouping | 공간 그룹핑 | Proximity, 근접성 | foundational | standard | 가까이 둔 요소는 한 묶음으로 읽힌다는 근접성(게슈탈트) 원리로 관계를 나타내는 배치. 모든 항목을 같은 간격으로 늘어놓으면 묶음이 안 보이지만, 그룹 안은 좁게 그룹 사이는 넓게 두면 구조가 드러난다. 폼 필드 묶음이나 카드 내부 정보 정리에 쓴다. | 폼 필드 그룹, 카드 내부 정보 묶음 | 모든 요소를 균등 간격으로 늘어놓는 단일 격자 | Stack | Flexbox / gap / 차등 margin | Form, List, Descriptions | Macro/Micro Whitespace |  |
| figure-ground | Figure-Ground | 형상-배경 |  | foundational | standard | 전경과 배경을 명도·레이어로 분리해 주목 대상을 띄우는 대비. 같은 면에 평면으로 깔면 무엇이 위인지 안 보이지만, 배경을 어둡게 깔고 대상을 위로 올리면 전경이 도드라진다. 모달·오버레이 히어로·강조 카드에 쓴다. | 모달, 오버레이 히어로, 강조 카드 | 전경·배경 구분 없이 평면으로 읽혀야 하는 표·리스트 | Stack | z-index / backdrop overlay / box-shadow | Modal / Dialog, Spotlight, FullBleed | Overlay Hero, Z-axis Layering |  |
| focal-point | Focal Point | 초점 |  | foundational | standard | 시선이 가장 먼저 닿도록 화면을 지배하는 단일 요소. 동등한 버튼·링크를 여럿 늘어놓으면 시선이 분산되지만, 하나만 크게·강하게 두면 거기로 시선이 모인다. 단일 CTA 화면이나 랜딩 첫 화면에 쓴다. | 단일 CTA 화면, 랜딩 첫 화면 | 동등한 선택지를 여럿 나열하는 메뉴·옵션 화면 | Stack | 크기·색 대비 / 여백 격리 / z-index | Button, Hero + 스크롤, Spotlight | Dominant Entry Point, Rule of Thirds |  |
| z-axis-layering | Z-axis Layering | 레이어드(깊이) |  | mainstream | standard | 요소를 겹치고 그림자를 줘 화면 앞뒤(z축) 깊이 위계를 만드는 배치. 모두 같은 평면에 두면 납작하지만, 카드를 띄우고 그림자를 깔면 무엇이 위에 떠 있는지 읽힌다. 오버랩 구성이나 카드 부상, 입체 인상에 쓴다. | 오버랩 구성, 카드 부상, 입체 인상 | 겹침 없는 엄격한 평면 정렬이 원칙인 스위스 그리드 | Stack | z-index / box-shadow / transform | StackedCard, OverlappingStack, HoverCard | Overlap/Off-grid, Figure-Ground | Swiss / International Grid |

### 4. Space, Whitespace & Rhythm · 공간·여백·리듬

여백과 간격으로 호흡과 밀도를 조절하는 규칙. 레이아웃의 인상을 좌우한다.

| ID | Pattern | 한글 | Aliases | Maturity | Evidence | Description | Best For | Avoid For | Reflow | Line Length | Prompt Example | Build | Components | Good With | Avoid With |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| macro-micro-whitespace | Macro/Micro Whitespace | 거시·미시 여백 |  | foundational | standard | 블록 사이의 큰 여백(거시)과 요소 안의 작은 여백(미시)을 다른 단위로 구분해 다루는 체계. 모든 간격을 한 값으로만 쓰면 묶음 경계가 흐려지지만, 거시·미시를 분리하면 호흡과 위계가 동시에 산다. 프리미엄 인상이나 가독성 높은 콘텐츠에 쓴다. | 프리미엄 인상, 가독성 높은 콘텐츠 | 간격을 한 단위로만 쓰는 초밀집 데이터 그리드 | Stack |  |  | margin (거시) / padding (미시) / spacing tokens | Space, Container, Separator / Divider | Negative Space, Spatial Grouping |  |
| margin-gutter | Margin & Gutter | 마진·거터 |  | foundational | standard | 콘텐츠 바깥을 두르는 여백(마진)과 컬럼 사이 간격(거터)을 따로 정의하는 기본 설정. 둘을 같은 값으로 뭉뚱그리면 가장자리와 컬럼 간격이 헷갈리지만, 분리하면 그리드 호흡이 일정해진다. 그리드 기반 모든 레이아웃의 기초 설정으로 쓴다. | 그리드 기반 모든 레이아웃의 기본 설정 | 여백 없이 화면 끝까지 채우는 풀블리드 미디어 | Reflow-Heavy |  | 바깥 마진 80px, 거터 24px | gap (거터) / padding (마진) / max-width | Grid, 12-Column, Container | Column Grid, 12-Column System |  |
| negative-space | Negative Space | 네거티브 스페이스 | White Space, 여백 | mainstream | standard | 의도적으로 비워 둬 남은 형상·메시지를 강조하는 빈 공간. 빈 곳을 무언가로 채워야 한다고 보는 것과 달리, 비움 자체를 디자인 요소로 써 대상을 도드라지게 한다. 미니멀 브랜드나 단일 메시지 강조에 쓴다. | 미니멀 브랜드, 단일 메시지 강조 | 한 화면에 많은 정보를 담아야 하는 밀집형 대시보드 | Stack |  |  | 넉넉한 margin / padding / max-width | Container, Hero + 스크롤, Single Column | Focal Point, Centered Hero | Maximalism |
| vertical-rhythm | Vertical Rhythm | 수직 리듬 |  | foundational | standard | 일관된 수직 간격 단위로 흐름을 만드는 리듬 | 긴 본문, 문서형 페이지 | 간격이 제각각이어도 무방한 짧은 단발 라벨 | Stack | 45-75ch |  | CSS / line-height | Paragraph, Heading, Single Column | Baseline Grid, Modular Scale |  |
| density-compact-airy | Density (Compact/Airy) | 밀도 |  | mainstream | standard | 한 화면에 담는 정보 밀도를 조밀하게 또는 여유롭게 정하는 선택. 간격을 한 값으로 고정하는 것과 달리, 맥락에 따라 간격·행 높이를 조여 정보를 많이 담거나 넓혀 호흡을 준다. 대시보드는 조밀하게, 마케팅 화면은 여유롭게 쓴다. | 대시보드는 조밀, 마케팅은 여유 | 여백 위주 브랜드 화면에 데이터 표 밀도를 강요하는 경우 | Reflow-Heavy |  |  | spacing tokens / line-height / padding 토큰 전환 | DataTable, List, BentoGrid | Dashboard/Analytics Grid, Sectioned Stack |  |
| padding-scale | Padding Scale | 패딩 스케일 |  | mainstream | standard | 4·8·16처럼 단계화한 간격 토큰만 써서 컴포넌트 간 여백을 통일하는 체계. 13px·19px 같은 임의값을 그때그때 쓰는 것과 달리, 정해진 척도에서만 골라 써 전 화면의 간격 리듬이 일관된다. 디자인 시스템과 컴포넌트 간격 통일에 쓴다. | 디자인 시스템, 컴포넌트 간격 통일 | 임의값 간격을 그때그때 쓰는 일회성 시안 | Stack |  |  | spacing tokens / CSS custom properties / padding | Space, Card, Container | Modular Scale |  |

### 5. Space Model & Stability · 공간 모델·안정성

레이아웃이 공간을 어떻게 차지하고(유동·고정·혼합) 어떻게 안 깨지나. 구조를 고르기 전에 정하는 최상위 결정이자, 넘침·시프트·구멍·불균형을 막는 안정성 원리.

#### 공간 배분 모델

| ID | Pattern | 한글 | Maturity | Sizing | Evidence | Description | Best For | Avoid For | Reflow | Build | Components | Good With |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| fluid-layout | Fluid Layout | 유동형 | foundational | fluid | standard | 영역이 fr·%·flex-grow 로 가용 폭을 비례 점유해 뷰포트와 함께 늘어나는 공간 모델. 고정 px 박스와 달리 화면이 커지면 콘텐츠도 같이 넓어져 큰 화면에 유휴 공간을 남기지 않는다. 콘텐츠 양이 가변인 피드·대시보드·갤러리에 쓴다. | 콘텐츠 양 가변, 대시보드·피드·갤러리, 큰 화면 활용 | 줄길이·이미지 비율을 엄격히 통제해야 하는 본문(과도하게 넓어짐) | Stack | fr / % / flex-grow / minmax() | Grid, Flex, Container | Card Grid, Dashboard / Analytics Grid, Single-column Feed |
| fixed-layout | Fixed Layout | 고정형 | foundational | fixed | standard | 고정 px 폭(또는 max-width) 박스를 중앙에 두고 뷰포트와 무관하게 일정하게 유지하는 공간 모델. 유동형과 달리 콘텐츠 폭이 변하지 않아 줄길이·정렬을 정밀하게 통제하지만, 큰 화면에서는 양옆에 유휴 여백이 생긴다. 본문 가독성·인쇄지향 화면에 쓴다. | 본문 가독성(65ch) 통제, 인쇄지향, 정밀 정렬 | 대화면을 채워야 하는 대시보드(유휴 여백 위험) | Stack | max-width / width(px) / margin:auto | Container | Manuscript Grid, Centered Form, Article / Long-read |
| hybrid-layout | Hybrid Layout | 혼합형 | foundational | hybrid | standard | 일부 영역은 고정 px(내비·사이드바), 일부는 유동 fr(본문)로 섞는 공간 모델. 전부 고정이거나 전부 유동인 방식과 달리 영역마다 역할에 맞는 규칙을 줘, 내비는 흔들리지 않고 본문은 화면을 채운다. 앱 셸·문서·마스터-디테일 등 실무 대부분이 이 모델이다. | 앱 셸, 문서, 마스터-디테일 (대부분의 실무) | 모든 영역이 동등해야 하는 단순 단일 페이지 | Reorder | grid-template-columns: 280px 1fr / minmax() / flex-shrink:0 | Sidebar, NavigationDrawer, Grid | Holy Grail Layout, Sidebar + Content, Split-view (Master-Detail) |

#### 공간 충전 규칙

| ID | Pattern | 한글 | Maturity | Evidence | Description | Best For | Avoid For | Build | Components | Good With | Avoid With |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| space-saturation | Space Saturation | 공간 포화 | foundational | practice | 화면을 의도적으로 채워 불필요한 유휴 공간이나 어색하게 뚫린 구멍을 남기지 않는 원칙. 콘텐츠를 위에서부터 쌓아 아래가 휑하게 비는 것과 달리, 영역을 프레임에 맞춰 포화시킨다. 단 여백 자체가 메시지인 의도된 네거티브 스페이스와는 구분한다. | 대시보드·랜딩처럼 화면을 꽉 써야 하는 화면 | 여백 자체가 메시지인 미니멀·프리미엄 화면 | flex: 1 / grid 1fr / min-height: 100vh | Grid, Flex | Bento Grid, Dashboard / Analytics Grid | Negative Space |
| region-sizing-policy | Region Sizing Policy | 영역 정책 | foundational | practice | 어떤 영역을 유동으로 두고 어떤 영역을 고정할지 기획 의도와 콘텐츠 정책으로 정하는 원칙. 전 영역을 무심코 fr 로 지정하거나 전부 px 로 고정하는 것과 달리, 내비는 고정·본문은 유동처럼 역할별로 규칙을 배정한다. 혼합형 레이아웃 설계의 핵심 결정이다. | 앱 셸·문서 등 영역 역할이 다른 화면 | 단일 영역 화면(정책 결정이 불필요) | grid-template-columns: 280px 1fr / flex-shrink:0 / flex:1 | Sidebar, Grid | Hybrid Layout, Holy Grail Layout |  |
| balanced-fill | Balanced Fill | 균형 충전 | foundational | practice | 공간 모델에 맞게 영역을 채우되 한쪽만 뻥 뚫린 불균형을 피하는 원칙. 큰 블록 하나에 자투리가 매달린 어색한 배치와 달리, 영역 무게를 고르게 분배해 레이아웃이 완결돼 보이게 한다. 포화(구멍 없음)와 짝을 이루는 시각 균형 규칙이다. | 여러 영역을 한 화면에 배치하는 모든 구성 | 긴장감이 목적인 의도적 비대칭 강조 | flex-basis / grid fr 비율 균형 | Grid, Flex | Space Saturation, Asymmetric Balance |  |

#### 안정성 가드레일

| ID | Pattern | 한글 | Maturity | Evidence | Description | Best For | Avoid For | Build | Components | Good With |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| overflow-containment | Overflow Containment | 오버플로 제어 | foundational | standard | flex·grid 자식이 콘텐츠 때문에 칸 밖으로 넘쳐 가로 스크롤과 깨짐을 만드는 것을 막는 원칙. 자식 min-width 기본값이 auto 라 긴 텍스트·URL·이미지가 칸을 밀어내는데, min-width:0 과 overflow·text-wrap 으로 콘텐츠를 칸 안에 가둔다. 레이아웃 불안정 1순위 원인을 차단한다. | 가변 콘텐츠(긴 제목·URL·표)가 들어가는 모든 flex/grid | 거의 항상 적용(예외 드묾) | min-width: 0 / overflow: hidden/auto / text-overflow: ellipsis / overflow-wrap | Container, Grid, Flex | Hybrid Layout, Sidebar + Content |
| intrinsic-sizing | Intrinsic Sizing | 내재 크기 | foundational | standard | 영역 크기를 콘텐츠가 필요로 하는 양에 맞춰 안전하게 정하는 원칙. 고정 px 로 지정해 콘텐츠가 넘치거나 남는 것과 달리, min-content·max-content·fit-content·minmax() 로 영역이 콘텐츠에 적응하게 한다. 칸이 콘텐츠를 못 담아 깨지는 일을 줄인다. | 콘텐츠 길이가 가변인 칸(태그·라벨·버튼 줄) | 의도적으로 폭을 고정해야 하는 정렬 격자 | min-content / max-content / fit-content / minmax() | Grid, Container | Fluid Layout, Card Grid |
| cls-prevention | CLS Prevention | 레이아웃 시프트 방지 | foundational | standard | 이미지·임베드·폰트가 늦게 로드되며 콘텐츠를 밀어내는 누적 레이아웃 시프트(CLS)를 막는 원칙. 높이를 비워뒀다 채우는 것과 달리, aspect-ratio·width/height·min-height 로 공간을 미리 예약해 나중 로드돼도 자리가 안 밀린다. 체감 안정성과 Core Web Vitals 에 직결된다. | 이미지·임베드·동적 콘텐츠가 있는 모든 페이지 | 거의 항상 적용 | aspect-ratio / width/height 속성 / min-height / font-display | AspectRatio, Image, Skeleton | Aspect-ratio Discipline, Card Grid |
| stacking-discipline | Stacking Discipline | 스태킹 규율 | foundational | standard | z-index 가 제멋대로 충돌해 모달·드롭다운·헤더가 엉뚱한 순서로 겹치는 것을 막는 원칙. 999999 같은 값을 즉흥적으로 쓰는 것과 달리, z-index 스케일과 isolation 으로 쌓임 맥락을 관리한다. 오버레이·겹침 레이아웃의 안정성을 지킨다. | 모달·드롭다운·오버랩 등 겹침이 있는 화면 | 평면 단일 레이어 정적 페이지 | z-index 스케일 / isolation: isolate / position | Modal / Dialog, OverlappingStack, Popover | Overlap / Off-grid, Figure-Ground, Modal-centric Flow |

## Part 2: 시선·가독 흐름

사용자의 눈이 화면을 훑는 경로와 우선순위 (11개 키워드)

### 5. Reading Paths · 읽기 경로

시선이 화면을 이동하는 전형적 경로. 콘텐츠 배치 순서의 근거가 된다. (NN/g 아이트래킹 근거)

| ID | Pattern | 한글 | Aliases | Maturity | Evidence | Description | Best For | Avoid For | Reflow | Build | Components | Good With |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| f-pattern | F-Pattern | F패턴 | F-shaped Reading, F자 패턴 | foundational | standard | 사용자가 본문을 위에서 아래로 차근차근 읽는다는 가정과 달리, 텍스트 위주 페이지에서 시선이 위 두세 줄을 가로로 길게 훑고 이후 왼쪽 가장자리만 세로로 따라 내려가 F자를 그린다는 NN/g 아이트래킹(232명) 관찰입니다. 핵심 정보를 왼쪽과 첫 줄에 앞세워야 하며, F 출현 자체는 위계 설계가 약하다는 신호이기도 합니다. | 텍스트 많은 목록, 검색 결과, 블로그 | 시각 위계가 명확히 설계된 페이지 (F 출현은 오히려 나쁜 신호) | Stack | CSS Grid | List, Paragraph, Heading | Single-column Feed, Article/Long-read |
| z-pattern | Z-Pattern | Z패턴 | Z-shaped | mainstream | practice | 텍스트가 적은 화면에서 시선이 좌상에서 우상, 다시 좌하에서 우하로 대각선을 그리며 이동한다고 보는 통용 모델입니다(NN/g 직접 정의 아님). 로고와 핵심 행동을 그 네 꼭짓점 동선에 맞춰 배치해 미니멀 랜딩의 시선을 단일 CTA 로 모읍니다. | 텍스트 적은 미니멀 랜딩, 단일 CTA | 텍스트 밀집 페이지 | Stack | CSS Grid | Button, Oversized Display | Hero-Centric Landing, CTA Banner |
| layer-cake | Layer-Cake Pattern | 레이어케이크 |  | mainstream | standard | 글을 한 줄도 빠짐없이 읽는다는 가정과 달리, 사용자가 헤딩과 서브헤딩만 케이크 층처럼 골라 보고 사이 본문은 건너뛴다는 NN/g(2004) 스캔 관찰입니다. 서브헤딩 한 줄만 읽어도 요지가 전달되도록 소제목을 자족적으로 쓰는 배치를 요구합니다. | 명확한 서브헤딩이 있는 스캔형 콘텐츠 | 서브헤딩이 약하거나 없는 텍스트 벽 | Stack | CSS Grid | Heading, Anchor | Sectioned Stack, Alternating (Zig-zag) Rows |
| gutenberg-diagram | Gutenberg Diagram | 구텐베르크 다이어그램 |  | foundational | practice | 정보 밀도가 균질한 페이지에서 시선이 좌상 1차 영역에서 우하 종착 영역으로 흐른다고 보는 4분면 모델입니다. 강한 시각 위계가 없을 때만 성립하므로, 크기나 대비로 주목점을 만든 화면에는 적용되지 않습니다. 신문형 균일 배치의 시작과 끝 위치를 정하는 근거로 씁니다. | 균일한 콘텐츠 페이지, 신문형 배치 | 강한 시각 위계가 있는 페이지 | Stack | CSS Grid | Paragraph, Heading | Magazine Layout |
| spotted-pattern | Spotted Pattern | 스팟형 |  | mainstream | standard | 처음부터 끝까지 읽는다는 가정과 달리, 사용자가 찾는 링크나 숫자, 특정 단어만 시각적으로 골라 잡고 큰 텍스트 덩어리는 통째로 건너뛰는 비선형 스캔입니다(NN/g). 가격이나 결과값 같은 표적 정보를 대비로 도드라지게 만들어 탐색 과업을 빠르게 끝내게 합니다. | 검색 결과, 가격표, 비교 화면, 탐색 과업 | 순차적으로 읽혀야 하는 내러티브 | Reflow-Heavy | CSS Grid | DataTable, Tag | Comparison Table, Pricing Page |
| commitment-zigzag | Commitment / Zigzag | 지그재그 | Commitment Pattern | mainstream | standard | 스캔하며 대충 훑는다는 가정과 달리, 사용자가 좌우 교차 배치를 따라 거의 모든 단어를 차례로 읽어 내려가는 고관여 몰입 경로입니다(NN/g). 이미지와 글을 지그재그로 번갈아 놓아 스토리텔링의 리듬을 만드는 배치를 요구합니다. | 스토리텔링 랜딩, 고관여 콘텐츠 | 빠른 스캔이 핵심인 데이터 | Reorder | CSS Grid | Image, Heading, Paragraph | Alternating (Zig-zag) Rows, Layer-Cake Pattern |

### 6. Entry Points & Emphasis · 진입점·강조

시선이 가장 먼저 닿는 지점과 멈추는 지점을 설계하는 장치.

| ID | Pattern | 한글 | Aliases | Maturity | Evidence | Description | Best For | Avoid For | Reflow | Prompt Example | Build | Components | Good With |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| dominant-entry-point | Dominant Entry Point | 지배적 진입점 |  | foundational | standard | 동등한 진입 후보가 여럿이라 시선이 분산된다는 상황과 달리, 화면에 다른 모든 요소를 압도하는 단 하나의 시작점을 두어 시선이 그곳에 먼저 강제로 닿게 하는 장치입니다. 크기와 대비를 한 요소에 몰아주며, 단일 목적 랜딩에서 핵심 메시지나 CTA 로 시선을 끌어옵니다. | 단일 목적 랜딩, 명확한 CTA 유도 | 여러 동등한 선택지를 제시하는 화면 | Reorder |  | CSS Grid / Flexbox | Oversized Display, Heading, Button | Focal Point, Centered Hero |
| visual-anchor | Visual Anchor | 시각 앵커 |  | mainstream | practice | 모든 요소가 비슷한 무게로 흩어진다는 상황과 달리, 큰 이미지나 일러스트 같은 강한 시각 요소 하나가 시선을 붙들어 머무는 닻 역할을 하는 장치입니다. 주변 텍스트는 이 앵커에 종속되게 배치해, 히어로 영역에서 시선이 흩어지지 않고 한 곳에 고이게 만듭니다. | 히어로 이미지, 핵심 일러스트 | 여러 요소가 동등하게 중요해 단일 앵커가 위계를 왜곡하는 화면 | Stack |  | CSS Grid / object-fit:cover | Image, Oversized Display | Full-bleed Hero |
| scan-stoppers | Scan Stoppers | 스캔 정지점 |  | mainstream | practice | 긴 페이지를 빠르게 스크롤하며 지나친다는 흐름과 달리, 색·여백·크기의 대비가 큰 띠를 본문 사이에 끼워 스크롤 중 시선을 강제로 멈추게 하는 장치입니다. 중간 CTA 나 핵심 지표를 이 정지점에 두되, 너무 잦으면 모든 것이 강조되어 효과가 사라지므로 드물게 씁니다. | 긴 페이지 중간 CTA, 강조 배너 | 대비 요소가 너무 잦아 모든 것이 강조되어 강조가 사라지는 화면 | Stack |  | Flexbox / background-color / padding | Alert, Button, Statistic | CTA Banner, Stat / Metric Band |
| above-the-fold-priority | Above-the-fold Priority | 첫 화면 우선순위 | Above the Fold, 폴드 위 | mainstream | standard | 필요한 정보가 어딘가에는 있으니 스크롤하면 된다는 가정과 달리, 다수 사용자가 스크롤 전 첫 화면만 보고 이탈한다는 전제에서 헤드라인·핵심 비주얼·CTA 를 폴드 위 한 화면 안에 모으는 원칙입니다. 전환 중심 랜딩에서 첫 화면 높이를 기준으로 정보 우선순위를 잡습니다. | 전환 중심 랜딩, 핵심 메시지 전달 | 폴드 개념이 약한 짧은 단일 화면이나 모든 정보를 동시에 펼쳐야 하는 비교 화면 | Stack | 첫 화면 안에 헤드라인·CTA·핵심 비주얼 배치 | CSS Grid / min-height:100vh | Oversized Display, Heading, Button | Hero-Centric Landing |
| progressive-disclosure | Progressive Disclosure Layout | 점진적 공개 배치 | Progressive Disclosure, 점진적 노출 | mainstream | standard | 모든 선택지를 한 화면에 펼쳐 보여 줘야 한다는 가정과 달리, 지금 단계에 필요한 만큼만 노출하고 나머지는 접거나 다음 단계로 미뤄 인지 부하를 낮추는 정보 배치입니다(NN/g). 복잡한 폼이나 온보딩을 단계로 쪼개되, 한눈 비교가 목적인 화면에는 쓰지 않습니다. | 복잡한 폼, 온보딩, 설정 화면 | 모든 정보를 한눈에 비교해야 하는 화면 | Stack |  | Collapse / Accordion / Steps / details/summary | Collapse / Accordion, Steps, Tabs | Wizard/Stepper, Scroll-triggered Reveal |

## Part 3: 페이지 아키타입

한 화면 전체를 구성하는 검증된 템플릿 (29개 키워드)

### 7. Landing & Marketing · 랜딩·마케팅

방문자를 전환으로 이끄는 마케팅 페이지의 전체 구조 원형. (표준 침묵, 실무 관행 영역)

| ID | Pattern | 한글 | Aliases | Maturity | Sizing | Evidence | Description | Best For | Avoid For | Reflow | Prompt Example | Build | Components | Good With |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| hero-centric-landing | Hero-Centric Landing | 히어로 중심 랜딩 | Hero + Scroll, Above-the-fold Landing, 히어로 배너 | mainstream | fluid | practice | 강한 히어로 + 하위 섹션으로 구성한 표준 랜딩 (NN/g 직접 정의 아님) | 제품·서비스 첫 소개, 전환 유도 | 즉시 데이터·기능 접근이 목적인 앱 셸/대시보드 | Stack |  | CSS Grid | Button, Oversized Display, Heading | Centered Hero, Sectioned Stack, Z-Pattern |
| long-form-sales | Long-form Sales Page | 롱폼 세일즈 | Sales Letter, 세일즈 레터 | mainstream | fluid | practice | 스크롤을 따라 문제 제기, 근거, 제안, 반론 해소 순으로 설득 논리를 길게 쌓는 판매 페이지. 정보만 나열하는 일반 랜딩과 달리 섹션 순서 자체가 구매 결정을 끌고 가는 서사 장치. | 고관여 상품, 강의·코스 판매 | 빠른 결정·단순 정보 전달 | Stack |  | CSS Grid / Scroll Snap / Position Sticky (CTA) | Statistic, Card, Button | Layer-Cake Pattern, Testimonial Wall |
| single-page-scroll | Single-Page Scroll | 원페이지 스크롤 | One-page, Onepager, 원페이지 | mainstream | fluid | practice | 여러 페이지로 나눌 콘텐츠를 한 문서에 모아 스크롤과 앵커 이동으로만 탐색하는 구조. 라우팅으로 화면을 분리하는 멀티페이지와 달리 페이지 전환 없이 한 흐름으로 읽히는 점이 핵심. | 소규모 브랜드, 이벤트, 포트폴리오 | 정보량이 많아 라우팅 분리가 필요한 서비스 | Stack |  | CSS Grid / scroll-behavior:smooth / Scroll Snap | ScrollSnap, NavigationMenu, Button | Scroll Snap Sections, Sectioned Stack |
| sectioned-stack | Sectioned Stack | 섹션 스택 | Stacked Sections, 섹션 적층 | mainstream | fluid | practice | 독립 섹션을 수직으로 쌓는 가장 흔한 랜딩 구조 | 대부분의 마케팅 페이지 | 동시 비교·탐색이 필요한 데이터 화면 | Stack | 히어로 / 기능 / 후기 / 가격 / CTA 순 섹션 스택 | CSS Grid | Card, Button, Statistic | Feature Grid, CTA Banner, Layer-Cake Pattern |
| pricing-page | Pricing Page | 가격 페이지 | Pricing Table, 요금제 비교 | mainstream | fluid | practice | 요금제 컬럼을 나란히 세워 항목별로 가로 비교시키는 전환 핵심 페이지. 가격을 단순 나열하는 목록과 달리 동일 행에 같은 항목을 정렬해 차이를 즉시 읽게 만드는 점이 본질. | SaaS 요금제, 구독 상품 | 단일 가격·무료 서비스 | Stack |  | CSS Grid / Subgrid (항목 정렬) | DataTable, ActionCard, Button | Comparison Table, Spotted Pattern |
| coming-soon-teaser | Coming-soon / Teaser | 티저 | Launch Page, Waitlist, 사전예약 | mainstream | fixed | practice | 출시 전 핵심 한 줄과 가입 폼만 화면 중앙에 남기는 최소 페이지. 본 랜딩에서 섹션을 덜어낸 게 아니라 단일 전환(사전 예약)만 남기려 의도적으로 비운 구조. | 사전 예약, 웨이팅리스트 수집 | 본 서비스 탐색 | Stack |  | Flexbox / min-height:100vh / place-items:center | Form, Input, Button | Centered Hero, Centered Form |

### 8. Content & Editorial · 콘텐츠·매거진

읽는 경험이 중심인 콘텐츠 헤비 페이지의 구조 원형.

| ID | Pattern | 한글 | Aliases | Maturity | Sizing | Evidence | Description | Best For | Avoid For | Reflow | Structure | Line Length | Build | Components | Good With |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| magazine-layout | Magazine Layout | 매거진 레이아웃 | Editorial Grid, 에디토리얼 그리드 | mainstream | fluid | practice | 다단 컬럼과 풀와이드 이미지를 섞는 잡지형 구조 | 에디토리얼 매체, 피처 기사 | 단순 폼·앱 셸 | Reflow-Heavy |  | 45-75ch | CSS Grid / Subgrid | Heading, Image, Blockquote | Hierarchical Grid, Compound Grid |
| article-longread | Article / Long-read | 아티클·롱리드 | Single Column, One-column Article, 단일 컬럼 | mainstream | fixed | standard | 단일 컬럼 본문에 미디어를 끼우는 읽기 중심 구조 | 블로그 글, 뉴스 기사, 에세이 | 대량 데이터 비교·탐색 | Stack | 1 column | 45-75ch (66ch 권장) | max-width:65ch / margin:auto | Paragraph, Heading, Blockquote, Image | F-Pattern, Vertical Rhythm |
| two-column-editorial | Two-column Editorial | 2단 에디토리얼 |  | mainstream | fixed | standard | 본문 컬럼 옆에 주석, 인용, 참고를 나란히 두어 흐름을 끊지 않고 보조 정보를 붙이는 구조. 본문 사이에 끼워 넣는 단일 컬럼과 달리 가로 병치로 본문 리듬을 지키는 점이 다름. | 주석·인용이 많은 글, 학술 콘텐츠 | 좁은 모바일 우선 화면 | Stack | 2 columns | 45-75ch | CSS Grid / grid-template-columns:2fr 1fr | Paragraph, Descriptions | Sidebar + Content |
| sidebar-content | Sidebar + Content | 사이드바+본문 | Two-pane, 사이드바 레이아웃 | mainstream | hybrid | standard | 고정 사이드바와 가변 본문을 나눈 구조 (web.dev·MDN 정식 패턴) | 문서 사이트, 위키, 블로그 인덱스 | 단일 메시지 랜딩, 미니멀 포트폴리오 | Reorder | aside + main | 65ch (본문) | CSS Grid / Position Sticky | Sidebar, NavigationDrawer, List | Documentation Layout, Sticky Header/Sidebar |
| documentation-layout | Documentation Layout | 문서형 | Docs Layout, Three-pane Docs | mainstream | hybrid | standard | 좌측 내비 + 본문 + 우측 목차의 3단 문서 구조 | 개발 문서, 핸드북, 가이드 | 마케팅·랜딩 | Reorder | nav + main + toc | 65-75ch | CSS Grid / Position Sticky | Sidebar, Anchor, Tree, Breadcrumb | Sidebar + Content, Sticky Header/Sidebar |
| full-bleed-content | Full-Bleed Content | 풀블리드 콘텐츠 | Full-Bleed, Edge-to-edge, Full-width Breakout, 풀블리드 | mainstream | hybrid | practice | 본문은 폭 제한하되 특정 요소(이미지·인용·배경 섹션)만 화면 좌우 끝까지 흘러나가는 기법 (인쇄 용어 차용) | 1칼럼 기사/블로그에서 이미지·배경 섹션 강조, 몰입형 비주얼 | 모든 요소가 폭 제한 그리드를 따라야 하는 데이터 밀집 UI | Reflow-Heavy | constrained body + breakout | 65ch (본문) + 예외 요소 | CSS Grid | Image, Blockquote | Article / Long-read, Magazine Layout |

### 9. App & Dashboard · 애플리케이션·대시보드

작업과 데이터 조작이 중심인 애플리케이션 셸의 구조 원형.

| ID | Pattern | 한글 | Aliases | Maturity | Sizing | Evidence | Description | Best For | Avoid For | Reflow | Structure | Build | Components | Good With |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| holy-grail | Holy Grail Layout | 홀리그레일 | Three-column Layout, Holy Grail, 3칼럼 레이아웃 | mainstream | hybrid | standard | 헤더·푸터와 좌우 사이드, 중앙 본문의 고전 5분할 (web.dev·Wikipedia 정의) | 범용 앱 셸, 관리 도구 | 단일 메시지 랜딩 | Reorder | header/footer + 3 cols | CSS Grid | Sidebar, TopAppBar, NavigationRail | Sidebar Nav Shell |
| sidebar-nav-shell | Sidebar Nav Shell | 사이드바 셸 | App Shell, Nav Drawer Shell | mainstream | hybrid | standard | 좌측 내비 + 우측 콘텐츠의 앱 표준 셸 | SaaS 대시보드, 어드민 | 읽기 전용 콘텐츠 사이트 | Reorder | sidebar + content | CSS Grid / Position Sticky | NavigationDrawer, NavigationRail, Sidebar, Menu | Dashboard/Analytics Grid, Off-canvas Panel |
| dashboard-grid | Dashboard / Analytics Grid | 대시보드 그리드 | Widget Grid, 대시보드 | mainstream | fluid | standard | KPI, 차트, 표 위젯을 모듈러 격자에 배치해 한 화면에서 여러 지표를 동시에 훑게 하는 데이터 화면. 위젯을 세로로 쌓는 단순 스택과 달리 위젯마다 격자 칸 수를 달리해 중요도를 면적으로 표현. | 분석 대시보드, 모니터링 | 단일 선형 내러티브 | Reflow-Heavy |  | CSS Grid / grid-auto-flow:dense / Subgrid | DataTable, Statistic, Card | Modular Grid, Bento Grid, Density (Compact/Airy) |
| split-view-master-detail | Split-view (Master-Detail) | 마스터-디테일 | List-Detail, List-Detail Pane, 목록-상세 | mainstream | hybrid | standard | 목록(마스터)과 상세(디테일)를 좌우로 연동하는 구조 (Material canonical: list-detail) | 메일, 파일 관리자, 설정 | 단순 단일 페이지 | Reflow-Heavy | list + detail | CSS Grid | List, DataTable | Inbox Layout, Supporting Pane |
| supporting-pane | Supporting Pane | 서포팅 페인 | Supporting Panel, 보조 패널 | mainstream | hybrid | standard | 주 영역 옆에 보조 패널을 두는 Material canonical 레이아웃 (웹앱 한정) | 문서 편집기 보조 패널, 속성 인스펙터, 도구 패널 | 단순 단일 메시지 페이지, 좁은 모바일 우선 | Reflow-Heavy | main + supporting (≈70/30) | CSS Grid | Drawer, Sheet, Descriptions | Split-view (Master-Detail), Sidebar Nav Shell |
| kanban-board | Kanban / Board | 칸반 보드 | Board View, 칸반 | mainstream | hybrid | practice | 상태별 컬럼에 카드를 세로로 쌓고 컬럼 간 드래그로 진행 상태를 옮기는 보드. 목록 하나에 모두 담는 리스트와 달리 컬럼 위치 자체가 작업 단계를 뜻하는 점이 핵심. | 작업 관리, 파이프라인, 협업 툴 | 선형 읽기 콘텐츠 | Reflow-Heavy |  | Flexbox (가로 컬럼) / overflow-x:auto / drag-and-drop | Card, HorizontalScroll | Horizontal Scroll |
| inbox-layout | Inbox Layout | 인박스형 | Mail Layout, 메일 레이아웃 | mainstream | hybrid | practice | 폴더, 메시지 목록, 미리보기를 좌에서 우로 흐르게 배치해 한 화면에서 선택과 읽기를 끝내는 메시지형 구조. 목록과 상세를 화면 전환으로 나누는 방식과 달리 세 영역을 항상 보이게 두는 점이 다름. | 메일함, 알림, 메시지 앱 | 마케팅·콘텐츠 사이트 | Reflow-Heavy |  | CSS Grid / grid-template-columns:0.8fr 1.4fr 2fr | List, DataTable, Badge | Split-view (Master-Detail) |

### 10. Feed & Gallery · 피드·갤러리

콘텐츠 단위를 흐름이나 격자로 나열하는 탐색형 구조 원형.

| ID | Pattern | 한글 | Aliases | Maturity | Sizing | Evidence | Description | Best For | Avoid For | Reflow | Structure | Build | Components | Good With | Avoid With |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| single-column-feed | Single-column Feed | 단일 컬럼 피드 | Timeline Feed, Stream, 피드 | mainstream | fluid | standard | 하나의 컬럼에 콘텐츠를 시간순으로 흘리는 구조 (Material canonical: feed) | SNS 피드, 타임라인, 모바일 우선 | 동시 비교가 필요한 카탈로그 | Stack | 1 column | Flexbox | Card, List, ScrollReveal | F-Pattern, Infinite Scroll / Infinite Canvas |  |
| card-grid | Card Grid | 카드 그리드 | Uniform Card Grid, Card Layout, 카드 레이아웃 | mainstream | fluid | standard | 균일한 카드를 격자로 나열하는 가장 흔한 목록 구조 (NN/g 카드 컴포넌트 정의) | 상품 목록, 아티클 인덱스, 갤러리 | 단일 선형 내러티브 | Reflow-Heavy |  | CSS Grid | BaseCard, MediaCard, ElevatedCard | Modular Grid, Aspect-ratio Discipline |  |
| masonry-gallery | Masonry Gallery | 메이슨리 갤러리 | Masonry, Grid-lanes, Pinterest-style, 메이슨리 | mainstream | fluid | standard | 높이가 다른 카드를 벽돌처럼 채우는 핀터레스트형 배치 (CSS Grid Level 3 grid-lanes) | 이미지 갤러리, 무드보드, 포트폴리오 | 항목 순서·정렬이 중요한 비교 | Reflow-Heavy |  | CSS Grid / JS | MediaCard, Gallery, Lightbox | Native CSS Masonry | Aspect-ratio Discipline |
| justified-gallery | Justified Gallery | 저스티파이드 갤러리 | Flickr-style Gallery, 저스티파이드 | mainstream | fluid | practice | 원본 비율을 유지한 채 각 행의 높이를 맞춰 좌우 끝을 가지런히 정렬하는 사진 갤러리. 비율을 강제로 자르는 균일 그리드와 달리 사진을 안 자르면서도 행 양끝을 정렬하는 점이 특징. | 사진 포트폴리오, 이미지 아카이브 | 텍스트 중심 목록 | Reflow-Heavy |  | Flexbox / object-fit:cover / 행 높이 계산 JS | Image, Gallery, Lightbox | Mosaic / Tile |  |
| mosaic-tile | Mosaic / Tile | 모자이크 타일 | Tile Grid, 타일 그리드 | mainstream | fluid | practice | 크기가 다른 타일을 빈틈없이 격자에 채워 면을 메우는 배치. 모든 칸이 같은 메이슨리와 달리 특정 타일을 여러 칸 차지하게 키워 시선 강약을 만드는 점이 다름. | 미디어 갤러리, 카테고리 진열 | 순차 읽기 콘텐츠 | Reflow-Heavy |  | CSS Grid / grid-column/row:span | MediaCard, Image | Bento Grid, Card Grid |  |

### 11. Auth & Utility · 진입·유틸리티

인증·전환·예외 상황을 처리하는 단일 목적 페이지의 구조 원형.

| ID | Pattern | 한글 | Aliases | Maturity | Sizing | Evidence | Description | Best For | Avoid For | Reflow | Structure | Build | Components | Good With |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| centered-form | Centered Form | 중앙 정렬 폼 | Single-column Form, 중앙 폼 | mainstream | fixed | standard | 화면 중앙에 폼만 두는 집중형 구조 (NN/g 단일 컬럼 폼 권고) | 로그인, 회원가입, 단일 입력 | 대량 필드의 복합 데이터 입력 | Stack | centered card | Flexbox | Form, Input, Button, Checkbox | Symmetric Balance, Coming-soon / Teaser |
| split-screen-auth | Split-screen Auth | 분할 인증 | Two-column Auth, 분할 로그인 | mainstream | hybrid | practice | 한쪽 비주얼·한쪽 폼으로 나눈 인증 화면 | 브랜드 인상이 중요한 로그인 | 미니멀·빠른 진입 | Stack | 50-50 split | CSS Grid | Form, Input, Image | Split Hero (Text/Visual), Split-screen |
| wizard-stepper | Wizard / Stepper | 위저드 | Multi-step Form, Stepper, 단계 폼 | mainstream | fixed | standard | 긴 작업을 여러 단계로 쪼개 한 번에 한 단계만 보여주고 순서대로 진행시키는 구조. 모든 필드를 한 화면에 펼치는 폼과 달리 진행 표시와 뒤로/다음 버튼으로 인지 부담을 단계별로 나누는 점이 핵심. | 온보딩, 체크아웃, 복잡한 폼 | 단일 입력·즉시 제출 | Stack |  | Flexbox / 단계 상태 관리 JS | Steps, Form, Button | Progressive Disclosure Layout |
| empty-error-page | Empty / Error Page | 빈·오류 페이지 | Empty State, 404, 빈 상태 | mainstream | fixed | standard | 빈 목록이나 오류 상황을 일러스트와 메시지로 안내하고 다음 행동 버튼을 제시하는 화면. 그냥 비워 두거나 에러 코드만 노출하는 방식과 달리 사용자가 막힌 지점에서 빠져나갈 길을 함께 주는 점이 다름. | 404, 빈 목록, 권한 오류 | 정상 콘텐츠 노출 | Stack |  | Flexbox / place-items:center | Empty, Result, Button | Centered Hero |
| modal-centric-flow | Modal-centric Flow | 모달 중심 | Dialog Flow, 모달 플로우 | mainstream | fixed | practice | 현재 페이지를 어둡게 깐 채 위에 모달을 띄워 맥락을 잃지 않고 작업을 끝내는 흐름. 전체 페이지로 이동하는 방식과 달리 배경 맥락을 유지해 작업 후 원래 화면으로 자연스럽게 복귀시키는 점이 핵심. | 빠른 생성·편집, 확인 단계 | 긴 폼·다단계 입력(전체 페이지가 나음) | Stack |  | position:fixed / z-index / backdrop (dim) | Modal / Dialog, Sheet, Drawer, AlertDialog | Figure-Ground |

## Part 4: 섹션·블록 컴포지션

페이지 내부 한 구획의 배치 패턴 (구조 축) (21개 키워드)

### 12. Hero Composition · 히어로 구성

첫 화면 히어로 영역의 배치 변형. 첫인상을 결정하는 구획.

| ID | Pattern | 한글 | Aliases | Maturity | Sizing | Evidence | Description | Best For | Avoid For | Reflow | Structure | Prompt Example | Build | Components | Good With |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| centered-hero | Centered Hero | 중앙 히어로 | Centered Hero Section, 중앙 정렬 히어로 | mainstream | fluid | practice | 헤드라인과 CTA를 화면 중앙 한 축에 세로로 정렬한 가장 단순한 히어로. 좌우 여백을 대칭으로 비워 시선을 단일 메시지에 모으며, 비주얼 분할 없이 카피만으로 첫인상을 끌고 가는 미니멀 구성에 쓴다. | 단일 메시지, 미니멀 브랜드 | 다중 비교 콘텐츠 | Stack |  |  | Flexbox | Oversized Display, Button, Heading | Symmetric Balance, Negative Space |
| split-hero | Split Hero (Text/Visual) | 분할 히어로 | Two-column Hero, 50/50 Hero, 분할 히어로 | mainstream | hybrid | practice | 히어로를 좌측 텍스트와 우측 비주얼 두 컬럼으로 나눈 구성. 중앙 단일 축 히어로와 달리 카피와 제품 이미지를 동시에 동등한 비중으로 보여줘, 무엇을 말하는지와 무엇인지를 한 화면에서 같이 전달할 때 쓴다. | 제품 스크린샷·일러스트 동반 소개 | 단일 강력 메시지 | Stack | 50-50 or 60-40 | 히어로는 좌측 텍스트, 우측 제품 이미지 6:4 | CSS Grid | Image, Button, Oversized Display | Asymmetric Balance |
| full-bleed-hero | Full-bleed Hero | 풀블리드 히어로 | Full-screen Hero, 전체폭 히어로 | mainstream | fluid | practice | 이미지나 영상을 뷰포트 가장자리까지 꽉 채운 히어로. 컨테이너 여백 안에 가두는 일반 섹션과 달리 시각 요소가 화면 폭 전체를 점유해, 정보 전달보다 브랜드 분위기와 몰입을 앞세우는 캠페인 첫 화면에 쓴다. | 비주얼 강한 브랜드, 캠페인 | 정보 밀집·기능 중심 화면 | Stack |  |  | CSS Grid | Image, VideoBackground, Oversized Display | Visual Anchor, Overlay Hero |
| overlay-hero | Overlay Hero | 오버레이 히어로 | Text-over-image Hero, 오버레이 히어로 | mainstream | fluid | practice | 배경 미디어 위에 텍스트를 같은 레이어에 겹쳐 올린 히어로. 이미지와 카피를 위아래로 나눠 쌓는 구성과 달리 한 면에 포개 공간을 절약하지만, 배경 대비가 낮으면 가독성이 무너지므로 어둡게 깔거나 그라데이션 오버레이를 함께 둔다. | 몰입형 비주얼 + 메시지 동시 전달 | 낮은 대비로 가독성 위험한 경우 | Stack |  |  | position:absolute / z-index | Image, Oversized Display, AmbientBackground | Figure-Ground, Full-bleed Hero |
| video-hero | Video / Animated Hero | 영상 히어로 | Video Background Hero, 영상 배경 히어로 | mainstream | fluid | practice | 배경 영상이나 모션으로 주목을 끄는 히어로. 정지 이미지를 까는 풀블리드와 달리 움직임 자체로 시선을 잡아 제품 데모나 분위기를 강조하지만, 자동재생 영상이 성능과 데이터, 접근성에 부담을 주므로 정지 대체 이미지와 음소거를 기본으로 둔다. | 제품 데모, 분위기 강조 | 성능·접근성 민감 화면 | Stack |  |  | position:absolute / object-fit:cover / z-index | VideoBackground, Oversized Display, KineticTypography | Overlay Hero, Visual Anchor |

### 13. Split & Juxtaposition · 분할·병치

한 섹션을 둘 이상으로 나눠 대비·비교를 만드는 배치.

| ID | Pattern | 한글 | Aliases | Maturity | Sizing | Evidence | Description | Best For | Avoid For | Reflow | Structure | Line Length | Build | Components | Good With |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| split-screen | Split-screen | 스플릿 스크린 | Split 50/50, Dual-panel, Vertical Split, Two-column hero, 분할 화면 | mainstream | fluid | practice | 뷰포트 전체를 두 패널로 갈라 양쪽에 동등한 시각 비중을 주는 구성. 한쪽이 주가 되는 일반 섹션과 달리 두 선택지나 이중 내러티브를 대등하게 맞세워, 로그인 대 가입 같은 갈림길이나 인증 화면에 쓴다. 콘텐츠가 늘면 확장성이 낮다. | 두 선택지·이중 내러티브 동시 제시, 인증 페이지 | 콘텐츠가 많은 페이지(확장성 낮음) | Stack | 50-50 |  | CSS Grid | Image, Button | Split-screen Auth, Split Hero (Text/Visual) |
| fifty-fifty-block | 50-50 Block | 50-50 블록 | Media-Text Block, 반반 블록 | mainstream | fluid | practice | 텍스트와 미디어를 반반 폭으로 나눈 섹션 블록. 텍스트만 흐르는 본문과 달리 설명과 그것을 보여주는 이미지를 좌우로 짝지어, 기능 하나를 말과 그림으로 동시에 납득시킬 때 쓴다. 여러 개를 이으면 교차 행으로 발전한다. | 기능 소개, 텍스트+이미지 쌍 | 단일 메시지 강조 | Stack | 50-50 |  | CSS Grid | Image, Heading, Paragraph | Alternating (Zig-zag) Rows |
| alternating-rows | Alternating (Zig-zag) Rows | 교차 행 | Zig-zag Layout, Alternating Two-Column, 좌우 교차 | mainstream | fluid | practice | 반반 블록을 여러 행으로 쌓되 행마다 텍스트와 이미지의 좌우를 번갈아 두는 배치. 같은 정렬을 반복하는 나열과 달리 지그재그 리듬으로 단조로움을 깨, 여러 기능을 순차로 소개할 때 쓴다. 빠른 스캔이 핵심인 데이터에는 부적합하다. | 여러 기능을 리듬 있게 나열 | 빠른 스캔이 핵심인 데이터 | Reorder | alternating 50-50 rows | 65ch | CSS Grid | Image, Heading, Paragraph | 50-50 Block, Commitment / Zigzag |
| asymmetric-two-up | Asymmetric Two-up | 비대칭 2분할 | Asymmetric Split, 60/40, 70/30, 비대칭 분할 | emerging | fluid | practice | 폭이 다른 두 영역으로 나눈 분할. 좌우를 똑같이 가르는 50-50과 달리 60-40이나 70-30처럼 비중을 차등해 주와 부의 위계를 만들어, 한쪽 콘텐츠를 강조하면서 보조 정보를 곁들이는 섹션에 쓴다. 동등 비교에는 맞지 않는다. | 주·부 콘텐츠 위계가 있는 섹션 | 두 요소가 완전히 동등해야 하는 비교 | Stack | 60-40 / 70-30 |  | CSS Grid | Image, Heading | Asymmetric Balance, Hierarchical Grid |

### 14. Modular Arrangement · 모듈 배치

여러 콘텐츠 단위를 격자·묶음으로 배열하는 구조 패턴.

| ID | Pattern | 한글 | Aliases | Maturity | Sizing | Evidence | Description | Best For | Avoid For | Reflow | Prompt Example | Build | Components | Good With | Avoid With |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| bento-grid | Bento Grid | 벤토 그리드 | Bento Box Layout, Modular Grid, 벤토 박스 | mainstream | fluid | practice | 칸막이 도시락처럼 크기 다른 박스로 콘텐츠를 구획화. 큰 박스=높은 위계 (2024~ 부상, 표준 정의 없음) | 기능 요약, 제품 소개, 대시보드 위젯 | 선형 진행·심층 콘텐츠 | Reflow-Heavy | 벤토 그리드로 기능 6개, 첫 칸만 2배 크게 | CSS Grid / Subgrid | BentoCard, Card, Statistic | Modular Grid, Dashboard/Analytics Grid | Brutalism / Neo-brutalism |
| uniform-card-grid | Uniform Card Grid | 균일 카드 그리드 | Uniform Card Grid, 카드 그리드 | mainstream | fluid | standard | 동일 규격 카드를 같은 간격으로 반복 배치하는 표준 격자. 크기를 차등하는 벤토와 달리 모든 칸이 균일해 위계 없이 동등한 항목을 늘어놓아, 목록과 카탈로그, 갤러리처럼 개수가 가변인 컬렉션을 보여줄 때 쓴다. | 목록, 카탈로그, 갤러리 | 단일 선형 내러티브 | Reflow-Heavy |  | CSS Grid | BaseCard, MediaCard, ElevatedCard | Aspect-ratio Discipline, Mosaic / Tile |  |
| masonry | Masonry | 메이슨리 | Grid-lanes, Pinterest Layout, 메이슨리 | emerging | fluid | standard | 높이가 제각각인 항목을 열 단위로 흘려 빈틈없이 채우는 배치. 행을 맞추는 카드 그리드와 달리 아이템이 가장 짧은 열로 떨어져 위아래 여백을 없애, 비율이 다른 이미지 갤러리나 핀보드에 쓴다. 항목 순서나 정렬이 중요한 비교에는 부적합하다. | 이미지 위주 갤러리, 핀보드 | 항목 순서·정렬이 중요한 비교 | Reflow-Heavy |  | CSS Grid / column-count / JS | MediaCard, Gallery | Native CSS Masonry, Masonry Gallery |  |
| mosaic | Mosaic | 모자이크 | Tile Mosaic, 모자이크 | mainstream | fluid | practice | 크기가 다른 타일을 짜맞춰 면을 메우는 격자. 균일 카드 그리드와 달리 큰 타일과 작은 타일을 섞어 시각적 강약을 주면서도 전체 면은 빈틈없이 채워, 미디어 진열이나 카테고리 그리드처럼 보는 재미가 필요한 면에 쓴다. | 미디어 진열, 카테고리 그리드 | 균일 비교 목록 | Reflow-Heavy |  | CSS Grid | MediaCard, Image | Bento Grid |  |
| stacked-cards | Stacked Cards | 스택 카드 | Card Stack, Swipe Deck, 카드 덱 | emerging |  | practice | 카드를 평면에 늘어놓지 않고 z축으로 겹쳐 쌓아 깊이와 순서를 표현하는 배치. 동시 비교가 가능한 그리드와 달리 한 번에 맨 위 한 장에 집중시켜, 단계 강조나 스와이프 덱처럼 순차로 넘겨 보는 흐름에 쓴다. | 단계 강조, 스와이프 덱 | 동시 비교가 필요한 목록 | Stack |  | position:absolute / z-index / transform / JS | StackedCard, SwipeableCard | Sticky Stacking Cards, Z-axis Layering |  |
| tile-cluster | Tile Cluster | 타일 클러스터 | Grouped Tiles, 타일 묶음 | mainstream | fluid | practice | 관련 타일을 간격과 그룹으로 묶어 군집 단위로 구획하는 배치. 모든 칸을 같은 간격으로 펼치는 그리드와 달리 묶음 사이 여백을 벌려 소속 관계를 시각화해, 카테고리 허브나 기능 묶음처럼 그룹 경계가 의미를 갖는 면에 쓴다. | 카테고리 허브, 기능 묶음 | 단일 흐름 콘텐츠 | Reflow-Heavy |  | CSS Grid | Card, Chip | Spatial Grouping |  |

### 15. Feature & CTA Blocks · 강조·전환 블록

설득·전환을 위해 정보를 강조하는 섹션 블록 패턴.

| ID | Pattern | 한글 | Aliases | Maturity | Sizing | Evidence | Description | Best For | Avoid For | Reflow | Build | Components | Good With |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| feature-grid | Feature Grid | 피처 그리드 | Feature Cards, 기능 그리드 | mainstream | fluid | practice | 아이콘과 제목, 짧은 설명을 한 셀로 묶어 격자로 나열하는 기능 소개 블록. 줄글 설명과 달리 항목을 동등 규격으로 병렬해 혜택을 한눈에 훑게 해, 랜딩의 기능 요약 섹션에 쓴다. 심층 설명이나 항목 간 비교에는 맞지 않는다. | 기능·혜택 요약 섹션 | 심층 설명·비교 | Reflow-Heavy | CSS Grid | Card, BentoCard, Statistic | Sectioned Stack, Card Grid |
| comparison-table | Comparison Table | 비교 표 | Feature Comparison, Pricing Table, 비교 표 | mainstream | fluid | standard | 항목을 행으로, 비교 대상을 열로 세워 칸마다 값을 채우는 표 구조. 서술형 설명과 달리 같은 기준선에서 차이를 나란히 대조시켜, 요금제나 제품 스펙을 고르게 할 때 쓴다. 좁은 화면에서는 열이 무너지므로 카드형 재배치가 필요하다. | 요금제, 제품 스펙 비교 | 서사형 설명 | Reflow-Heavy | CSS Grid | DataTable, Table, Descriptions | Pricing Page, Spotted Pattern |
| testimonial-wall | Testimonial Wall | 후기 월 | Testimonial Grid, Social Proof Wall, 후기 벽 | mainstream | fluid | practice | 후기 카드를 벽처럼 빽빽이 채워 사회적 증거의 양감을 보여주는 블록. 후기 한두 개를 띄엄 두는 구성과 달리 다수를 한 면에 모아 신뢰의 규모 자체를 인상으로 남겨, 전환 직전 설득 구간에 쓴다. 보통 높이가 다른 카드라 메이슨리로 채운다. | 신뢰 형성, 전환 직전 설득 | 기능 비교·데이터 | Reflow-Heavy | CSS Grid | Card, Avatar, Rate | Masonry Gallery, Long-form Sales Page |
| stat-band | Stat / Metric Band | 지표 밴드 | Metrics Strip, KPI Band, 지표 띠 | mainstream | fluid | practice | 핵심 숫자 몇 개를 한 줄 가로 띠에 등간격으로 강조하는 블록. 본문에 수치를 섞어 묻는 방식과 달리 지표만 떼어 큰 활자로 나란히 세워 성과를 즉시 각인시켜, 신뢰 지표 노출에 쓴다. 맥락 설명이 필요한 데이터에는 맞지 않는다. | 성과 강조, 신뢰 지표 노출 | 맥락 설명이 필요한 데이터 | Stack | Flexbox | Statistic, Separator / Divider | Scan Stoppers |
| cta-banner | CTA Banner | CTA 배너 | Call-to-action Band, CTA Strip, CTA 띠 | mainstream | fluid | practice | 메시지와 버튼을 한 줄 강조 띠에 담아 행동을 유도하는 블록. 본문에 링크를 묻어 두는 방식과 달리 배경색이나 대비로 띠를 도드라지게 해 시선을 멈춰 세워, 섹션 사이나 페이지 끝 전환 지점에 쓴다. 정보 전달 본문에는 맞지 않는다. | 섹션 사이·페이지 끝 전환 유도 | 정보 전달 본문 | Stack | Flexbox | Button, Alert, Oversized Display | Scan Stoppers, Sectioned Stack |
| logo-cloud | Logo Cloud | 로고 클라우드 | Logo Bar, Client Logos, 로고 바 | mainstream | fluid | practice | 고객이나 파트너 로고를 한 줄이나 격자로 나열해 권위를 빌려오는 신뢰 블록. 텍스트 레퍼런스 목록과 달리 익숙한 로고를 시각적으로 늘어놓아 짧은 순간에 신뢰를 전이시켜, 히어로 아래나 전환 구간에 쓴다. 제품 기능 설명 자리는 아니다. | 레퍼런스 강조, 권위 부여 | 제품 기능 설명 | Reflow-Heavy | Flexbox | Image, Marquee | Stat / Metric Band |

## Part 5: 스크롤·반응 거동

스크롤과 뷰포트에 따라 변하는 동적 레이아웃 거동 (22개 키워드)

### 16. Scroll-driven · 스크롤 구동

스크롤 위치에 따라 콘텐츠가 전개·등장하는 거동 패턴.

| ID | Pattern | 한글 | Aliases | Maturity | Evidence | Description | Best For | Avoid For | Reflow | Build | Components | Good With | Avoid With |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| scrollytelling | Scrollytelling | 스크롤리텔링 | Scroll-driven Storytelling, Scrollytelling, 스크롤 스토리텔링 | mainstream | practice | 스크롤 진행에 따라 텍스트와 비주얼이 단계별로 맞물려 전개되는 거동입니다. 한 번에 다 보여주는 정적 기사와 달리 화면을 고정한 채 스크롤 위치를 진행도로 환산해 장면을 바꿉니다. Scroll API 로 구현합니다. | 데이터 기사, 롱폼 내러티브, 연례보고서 | 빠른 정보 접근·기능 중심 화면 | Stack | Scroll API / position:sticky / IntersectionObserver | ScrollScrubbing, PinnedContentSwap, ScrollReveal | Narrative Scroll, Pinned Section |  |
| scroll-triggered-reveal | Scroll-triggered Reveal | 스크롤 리빌 | Scroll Reveal, Scroll-triggered Animation, 스크롤 등장 | mainstream | practice | 요소가 뷰포트에 진입하는 순간 점진적으로 나타나는 거동입니다. 처음부터 다 노출하는 정적 페이지와 달리 진입 시점을 감지해 페이드나 슬라이드로 페이싱을 만듭니다. IntersectionObserver 로 진입을 판정합니다. | 점진적 정보 공개, 페이싱 | 즉시 전체 노출이 필요한 데이터 | Stack | IntersectionObserver / Scroll API / CSS Transition | ScrollReveal, StaggeredReveal, FadeTransition | Progressive Disclosure Layout, Sectioned Stack |  |
| parallax | Parallax | 패럴럭스 | Parallax Scroll, 시차 스크롤 | mainstream | practice | 레이어마다 스크롤 이동 속도를 다르게 줘 깊이감을 만드는 효과입니다. 모든 층이 같은 속도로 움직이는 평면 스크롤과 달리 배경은 느리게 전경은 빠르게 움직여 입체감을 냅니다. 성능과 접근성 부담이 있어 몰입형 히어로에 한정해 씁니다. | 몰입형 히어로, 스토리 섹션 | 성능·접근성 민감 화면, 대시보드 | Stack | Scroll API / transform: translate3d / will-change | Parallax, AmbientBackground | Full-bleed Hero, Z-axis Layering | Dashboard/Analytics Grid |
| horizontal-scroll | Horizontal Scroll | 가로 스크롤 | Horizontal Scrolling, 가로 스크롤 | emerging | practice | 콘텐츠를 세로가 아니라 가로 축으로 탐색하게 만드는 거동입니다. 기본 세로 스크롤과 달리 항목을 수평으로 늘어놓아 갤러리나 타임라인을 옆으로 훑게 합니다. overflow-x: auto 로 구현합니다. | 갤러리, 타임라인, 작품 나열 | 본문 읽기, 표준 탐색 기대 | Reflow-Heavy | overflow-x: auto / Scroll API / scroll-snap-type | HorizontalScroll, Carousel | Kanban / Board, Pinned Section |  |
| scroll-snap-sections | Scroll Snap Sections | 스크롤 스냅 | Full-page Scroll, Scroll Snapping, 스크롤 스냅 | mainstream | standard | 섹션 경계마다 스크롤이 딱 멈추며 정렬되는 거동입니다. 아무 데서나 멈추는 일반 스크롤과 달리 멈춤 지점을 섹션 단위로 고정해 슬라이드형 풀페이지 경험을 만듭니다. scroll-snap-type 으로 멈춤 축을 지정합니다. | 슬라이드형 풀페이지 경험 | 자유로운 스크롤이 필요한 긴 본문 | Stack | scroll-snap-type / scroll-snap-align | ScrollSnap | Single-Page Scroll |  |
| multi-directional-scroll | Multi-directional Scroll | 멀티 디렉셔널 스크롤 | 2D Scroll, 다방향 스크롤 | experimental | practice | 가로와 세로를 동시에 탐색하는 격자형 2축 스크롤입니다. 한 방향만 흐르는 선형 스크롤과 달리 평면 위를 상하좌우로 자유 이동하게 해 맵이나 아카이브 탐색에 씁니다. 선형 탐색이 필요한 서비스에는 부적합합니다. | 인터랙티브 맵, 아카이브 탐색 | 명확한 선형 탐색이 필요한 서비스 | Reflow-Heavy | Scroll API / overflow: auto / transform | ScrollArea, Carousel | Infinite Scroll / Infinite Canvas |  |
| narrative-scroll | Narrative Scroll | 내러티브 스크롤 | Choreographed Scroll, 내러티브 스크롤 | emerging | practice | 스크롤 진행을 타임라인 삼아 장면 전환과 모션을 정해진 순서로 이끄는 거동입니다. 단순 등장 효과와 달리 여러 요소의 진입과 퇴장을 스크롤 진행도에 묶어 설계합니다. 레이어드 롱폼 스토리텔링에서 Scroll API 로 구현합니다. | 레이어드 롱폼 스토리텔링 | 기능·데이터 중심 화면 | Stack | Scroll API / position:sticky / scroll-timeline | ScrollScrubbing, PinnedContentSwap | Scrollytelling, Pinned Section |  |

### 17. Sticky & Stacking · 고정·스택

요소를 고정하거나 쌓으며 스크롤 맥락을 유지하는 거동.

| ID | Pattern | 한글 | Aliases | Maturity | Evidence | Description | Best For | Avoid For | Reflow | Build | Components | Good With |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| sticky-header-sidebar | Sticky Header/Sidebar | 스티키 헤더·사이드바 | Sticky Nav, Affix, 고정 헤더 | mainstream | standard | 스크롤해도 상단·측면이 따라붙어 고정되는 거동 (position: sticky) | 내비 유지, 문서 목차 | 작은 화면에서 공간을 과하게 점유할 때 | Reorder | Position Sticky | Affix, TopAppBar, Sidebar | Documentation Layout, Sidebar + Content |
| pinned-section | Pinned Section | 핀드 섹션 | Pinned Scroll, Sticky Pin, 핀 고정 | mainstream | practice | 한 섹션을 화면에 고정한 채 그 안의 콘텐츠만 단계적으로 교체하는 거동입니다. 섹션이 스크롤과 함께 흘러가는 일반 배치와 달리 컨테이너를 붙잡아 둔 채 내부만 전환합니다. position:sticky 로 섹션을 핀 고정합니다. | 한 화면에서 다단계 스토리 | 빠른 탐색·짧은 페이지 | Stack | position:sticky / IntersectionObserver | PinnedContentSwap, ScrollScrubbing | Scrollytelling, Horizontal Scroll |
| sticky-stacking-cards | Sticky Stacking Cards | 스티키 스택 카드 | Stacking Cards, Sticky Stack, 스택 카드 | emerging | practice | 스크롤할수록 카드가 위에 겹겹이 쌓이며 포개지는 거동입니다. 카드가 따로 흘러가는 일반 리스트와 달리 각 카드를 같은 상단 위치에 sticky 로 붙여 누적되는 인상을 줍니다. position:sticky 로 구현합니다. | 단계 강조, 제품 피처 나열 | 동시 비교가 필요한 목록 | Stack | position:sticky / z-index | StickyStacking, StackedCard | Stacked Cards |
| sticky-scroll-reveal | Sticky Scroll Reveal | 스티키 스크롤 리빌 | Sticky Side Scroll, 고정 스크롤 전환 | emerging | practice | 한쪽 비주얼을 고정한 채 옆 텍스트가 스크롤로 교체되는 거동입니다. 글과 그림이 함께 흐르는 일반 배치와 달리 시각 요소를 sticky 로 붙잡고 설명만 단계별로 바꿉니다. position:sticky 로 구현합니다. | 제품 설명, 기능 단계 소개 | 짧은 콘텐츠·단순 페이지 | Stack | position:sticky / IntersectionObserver | PinnedContentSwap, ScrollReveal | Pinned Section, 50-50 Block |

### 18. Responsive Transformation · 반응형 변형

뷰포트 크기에 따라 레이아웃이 재구성되는 적응 패턴. (Luke Wroblewski 5패턴, web.dev 채택)

| ID | Pattern | 한글 | Aliases | Maturity | Sizing | Evidence | Description | Best For | Avoid For | Reflow | Prompt Example | Build | Components | Good With |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| mobile-first-stack | Mobile-first Stack | 모바일 우선 스택 | Mostly Fluid, Mobile-first, 모바일 우선 | mainstream | fluid | standard | 작은 화면에서 단일 컬럼으로 쌓고 위로 확장하는 전략 (Luke W: mostly fluid) | 모든 반응형 웹의 기본 출발점 | 데스크톱 전용 고밀도 도구 | Stack | 모바일은 1컬럼 스택, md 이상에서 3컬럼 | CSS Grid / Flexbox | Flex, Grid, Container | Card Grid, Sectioned Stack |
| reflow-reorder | Reflow / Reorder | 리플로우 | Column Drop, Layout Shifter, 리오더 | mainstream |  | standard | 화면 폭에 따라 요소 순서·흐름을 바꾸는 재배치 (Luke W: column drop / layout shifter) | 우선순위가 기기별로 다른 콘텐츠 | DOM 순서가 접근성에 중요한 경우(주의) | Reorder |  | CSS Grid / order | Grid, Flex | Mobile-first Stack |
| off-canvas-panel | Off-canvas Panel | 오프캔버스 | Off-canvas, Drawer Nav, 오프캔버스 | mainstream |  | standard | 화면 밖 영역에 숨겨 두었다가 슬라이드로 꺼내는 패널입니다. 항상 보이는 사이드바와 달리 좁은 화면에서 패널을 밖으로 밀어 두고 필요할 때만 열어 공간을 절약합니다. transform: translateX 로 출입을 처리합니다. | 모바일 내비, 필터 패널 | 항상 보여야 하는 핵심 내비 | Reorder |  | transform: translateX / transition | Drawer, NavigationDrawer, Sheet | Sidebar Nav Shell |
| priority-plus-navigation | Priority+ Navigation | 프라이오리티+ | Priority Plus, 우선순위 내비 | emerging |  | practice | 가용 폭에 맞춰 우선순위 높은 항목만 노출하고 나머지는 더보기 메뉴로 접는 내비입니다. 폭이 모자라면 줄바꿈하거나 잘리는 일반 메뉴와 달리 넘치는 항목을 자동으로 오버플로 메뉴에 담습니다. 항목 많은 메뉴의 반응형 처리에 씁니다. | 항목 많은 메뉴의 반응형 처리 | 항목이 적어 모두 보이는 메뉴 | Reorder |  | Flexbox / ResizeObserver | NavigationMenu, DropdownMenu, Menu | Off-canvas Panel |
| fluid-clamp-layout | Fluid (clamp) Layout | 플루이드 레이아웃 | Fluid Layout, Tiny Tweaks, 유동 레이아웃 | mainstream | fluid | standard | 브레이크포인트 없이 화면 폭에 따라 무단계로 스케일하는 레이아웃입니다. 구간마다 값이 점프하는 미디어 쿼리와 달리 폭 변화에 비례해 타이포와 간격이 매끄럽게 이어집니다. clamp() 로 최소·선호·최대값을 묶습니다. | 유동 타이포·간격, 매끄러운 반응 | 구간별로 전혀 다른 배치가 필요한 경우 | Stack |  | clamp() / min() / max() | Fluid Typography (clamp) | Modular Scale, Container Queries (enabler) |

### 19. Implementation Enablers (CSS) · 구현 enabler

레이아웃을 가능케 하는 CSS 메커니즘. 의도로 고르는 "패턴"이 아니라 위 패턴을 구현하는 도구다. 패턴과 구별해 둔다.

| ID | Pattern | 한글 | Aliases | Maturity | Sizing | Evidence | Description | Best For | Avoid For | Reflow | Build | Components | Good With |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| css-subgrid | CSS Subgrid (enabler) | CSS 서브그리드 | subgrid | emerging |  | standard | 자식 그리드가 부모의 트랙 라인에 그대로 정렬되도록 잇는 CSS 메커니즘입니다. 의도로 고르는 패턴이 아니라 중첩 그리드 정렬을 가능케 하는 도구입니다. 카드들의 내부 행 높이를 맞출 때 subgrid 값으로 적용합니다. | 카드 내부 정렬 일치, 복합 그리드 구현 | 구형 브라우저 폴백이 필수인 경우 | Reflow-Heavy | subgrid / grid-template-rows | Grid, Card | Card Grid, Magazine Layout |
| container-queries | Container Queries (enabler) | 컨테이너 쿼리 | @container, 컨테이너 쿼리 | emerging |  | standard | 뷰포트가 아니라 자기 컨테이너의 폭에 반응해 스타일을 바꾸는 CSS 메커니즘입니다. 화면 전체 기준인 미디어 쿼리와 달리 부모 폭을 기준 삼아 재사용 가능한 반응형을 가능케 합니다. container-type 으로 대상을 지정합니다. | 재사용 컴포넌트의 진짜 반응형 구현 | 단순 페이지 단위 반응형(미디어 쿼리로 충분) | Reflow-Heavy | container-type / @container | Card, Container | Fluid (clamp) Layout, Card Grid |
| native-css-masonry | Native CSS Masonry (enabler) | 네이티브 메이슨리 | grid masonry, grid-lanes | experimental |  | standard | JS 라이브러리 없이 높이가 제각각인 벽돌형 배치를 만드는 CSS 사양입니다. 좌표를 계산해 절대 배치하던 JS 메이슨리와 달리 그리드가 빈 공간을 채워 흐르게 합니다. 아직 표준 논의와 구현이 진행 중이라 폴백이 필요합니다. | Masonry 패턴의 네이티브 구현 | 브라우저 지원이 필요한 프로덕션(폴백 필수) | Reflow-Heavy | grid-template-rows: masonry / CSS Grid | Masonry, Gallery | Masonry, Masonry Gallery |
| has-conditional | :has() Conditional (enabler) | :has() 조건부 | :has(), parent selector | emerging |  | standard | 자식의 존재나 상태에 따라 부모의 레이아웃을 바꾸는 CSS 메커니즘입니다. 부모를 못 거슬러 올라가던 기존 선택자와 달리 JS 없이 조건부 배치를 가능케 합니다. :has() 로 자식 조건을 검사해 그리드나 카드 구성을 전환합니다. | JS 없는 조건부 그리드·카드 구현 | 구형 브라우저 폴백 필수 | Reflow-Heavy | :has() / CSS Grid | Grid, Card | Container Queries (enabler) |
| aspect-ratio-grid | Aspect-ratio Grid | 비율 그리드 | Ratio Grid, 비율 격자 | mainstream | fluid | standard | 셀마다 가로세로 비율을 고정해 균일한 타일을 만드는 격자입니다. 콘텐츠 높이에 따라 셀이 들쭉날쭉해지는 배치와 달리 비율을 고정해 일관된 미디어 타일을 얻습니다. aspect-ratio 로 셀 비율을 지정해 CLS 를 막습니다. | 일관된 미디어 타일, CLS 방지 | 높이가 콘텐츠에 따라 가변이어야 할 때 | Reflow-Heavy | aspect-ratio / CSS Grid | AspectRatio, MediaCard | Card Grid, Aspect-ratio Discipline |
| style-queries | Style Queries (enabler) | 스타일 쿼리 | @container style() | experimental |  | standard | 컨테이너의 스타일 값을 조건 삼아 내부 레이아웃을 바꾸는 차세대 CSS 메커니즘입니다. 폭만 보던 컨테이너 쿼리와 달리 커스텀 속성 같은 스타일 상태로 적응합니다. @container style() 로 질의하며 지원이 제한적입니다. | 테마·상태 기반 적응 컴포넌트 구현 | 현재 프로덕션(지원 매우 제한적) | Reflow-Heavy | @container style() / custom properties | Card, Container | Container Queries (enabler) |

## Part 6: 표현·실험 레이아웃

그리드 해체와 태도·스타일 (태도 축) (18개 키워드)

### 20. Grid-breaking · 그리드 해체

기준 그리드를 의도적으로 벗어나 역동성과 개성을 만드는 구조.

| ID | Pattern | 한글 | Aliases | Maturity | Evidence | Description | Best For | Avoid For | Reflow | Build | Components | Good With | Avoid With |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| broken-grid | Broken Grid | 브로큰 그리드 | Asymmetric Grid, Off-grid Layout, 비대칭 그리드 | emerging | practice | 기준 칼럼 그리드를 유지하되 일부 요소만 칼럼폭·정렬·시작선을 어긋내고 겹치게 하는 비대칭 배치입니다. 모든 블록을 칸에 가지런히 맞추는 정렬 그리드와 달리 의도적 어긋남으로 시선 리듬과 개성을 만들며, 그리드가 완전히 사라지는 게 아니라 부분적으로만 깨진다는 점이 핵심입니다. | 포트폴리오, 캠페인, 개성 강한 브랜드 | 빠른 스캔·기능적 일관성이 핵심인 사이트 | Reflow-Heavy | CSS Grid / z-index | BrokenGrid, OffsetLayout | Overlap/Off-grid, Asymmetric Layout | Dashboard/Analytics Grid, Comparison Table |
| deconstructed-grid | Deconstructed Grid | 해체 그리드 | Deconstruction, 해체주의 | experimental | practice | 기준 그리드를 조각으로 분해하고 위치·크기·정렬을 재배열해 원래 격자 흔적을 흐리는 구조입니다. 칸을 부분만 어긋내는 브로큰 그리드보다 더 나아가 격자 체계 자체를 해체하므로, 정돈된 일관성이 아니라 아방가르드한 긴장감을 노리는 에디토리얼·아트 맥락에 씁니다. | 아방가르드 에디토리얼, 패션·아트 | 기능·전환 중심 사이트 | Reflow-Heavy | CSS Grid / grid-column / transform | BrokenGrid, CollageLayout | Collage Layout, Zine Look |  |
| collage-layout | Collage Layout | 콜라주 | Collage, Cut-and-paste, 콜라주 | emerging | practice | 이미지·텍스트 조각을 오려붙인 듯 자유 위치에 겹치고 살짝 회전시켜 흩뜨리는 구조입니다. 칸에 맞춰 배치하는 카드 그리드와 달리 절대 위치와 겹침으로 손으로 붙인 콜라주 인상을 만들며, 내러티브 포트폴리오나 무드 강한 브랜드에서 정형 그리드의 단조로움을 깰 때 씁니다. | 내러티브 포트폴리오, 무드 강한 브랜드 | 가독성·빠른 탐색 중심 | Reflow-Heavy | position:absolute / transform:rotate / z-index | OverlappingStack, CollageLayout | Overlap/Off-grid, Zine Look |  |
| overlap-offgrid | Overlap / Off-grid | 오버랩 | Overlapping Layout, Off-grid, 겹침 레이아웃 | emerging | practice | 인접 요소가 칸 경계를 넘어 서로 겹치도록 음수 여백과 z축 순서로 쌓는 배치입니다. 블록을 칸 안에 가둬 간격으로 분리하는 일반 그리드와 달리 레이어가 포개지며 깊이감을 만들고, 히어로·갤러리에서 평면적 정렬을 벗어나 입체적 인상을 줄 때 씁니다. | 깊이감·레이어드 인상 | 정렬·일관성이 중요한 데이터 | Reflow-Heavy | position:absolute / margin 음수 / z-index | OverlappingStack, OffsetLayout | Z-axis Layering, Broken Grid |  |
| asymmetric-layout | Asymmetric Layout | 비대칭 레이아웃 | Asymmetrical Layout, 비대칭 배치 | mainstream | practice | 좌우 또는 상하 무게중심을 일부러 한쪽으로 치우치게 배분한 동적 배치입니다. 50대 50 대칭 분할이 주는 안정감 대신 비대칭 비율로 시선 흐름과 긴장감을 유도하며, 정적 그리드를 탈피해 개성과 방향성을 줄 때 씁니다. | 긴장감·시선 유도, 정적 그리드 탈피 | 균형·신뢰가 중요한 보수적 브랜드 | Stack | CSS Grid | Asymmetric Split, OffsetLayout | Asymmetric Balance, Hierarchical Grid |  |
| diagonal-skewed | Diagonal / Skewed Sections | 사선 섹션 | Diagonal Sections, Skewed Layout, 사선 분할 | emerging | practice | 섹션 경계를 수평선이 아닌 사선·기울임으로 잘라 화면을 분할하는 구조입니다. 가로로 반듯하게 쌓는 일반 섹션 스택과 달리 비스듬한 경계가 동적 리듬을 만들며, 단조로운 수평 분할을 깨고 흐름에 속도감을 줄 때 씁니다. | 단조로운 수평 분할 탈피, 동적 리듬 | 문서·데이터 중심 화면 | Stack | CSS / clip-path / transform | DiagonalGrid, SectionWipe | Sectioned Stack | Documentation Layout |

### 21. Attitude & Aesthetic · 태도·스타일

레이아웃을 통한 미학적 선언. 구조보다 태도가 앞서는 표현 양식. (2025~ 부상, 측정 근거 거의 없음)

| ID | Pattern | 한글 | Aliases | Maturity | Evidence | Description | Best For | Avoid For | Reflow | Line Length | Build | Components | Good With | Avoid With |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| brutalism | Brutalism / Neo-brutalism | 브루탈리즘 | Brutalist Web Design, Anti-grid, 브루탈리즘 | emerging | practice | 두꺼운 보더, 고대비, 시스템 폰트, 날것의 박스를 그대로 노출하는 반세련 양식입니다. 구조 자체보다 태도를 앞세우는 스타일 선언으로, 매끈하게 다듬은 디자인 트렌드에 대한 안티테제로서 강한 개성과 차별화를 노릴 때 씁니다. | 안티트렌드 선언, 강한 개성 브랜드, 차별화 | 접근성·전환 최적화가 핵심인 서비스 | Stack |  | border 두껍게 / system-ui 폰트 / outline | Neubrutalism | Anti-design, Marquee/Ticker | Negative Space, Bento Grid |
| anti-design | Anti-design | 안티 디자인 | Anti-design, 안티 디자인 | experimental | practice | 의도적 비정렬·요소 충돌·거친 마감을 미학으로 삼는 스타일 선언입니다. 정돈과 일관성을 추구하는 일반 디자인 규범을 일부러 위반해 주목과 진정성을 노리며, 구조 규칙이 아니라 태도의 표명이라 신뢰·명료성이 핵심인 서비스에는 맞지 않습니다. | 규칙 파괴로 주목·진정성 어필 | 신뢰·명료성이 핵심인 서비스 | Stack |  | transform:rotate / mix-blend-mode / position:absolute | Neubrutalism | Brutalism / Neo-brutalism, Maximalism |  |
| maximalism | Maximalism | 맥시멀리즘 | Maximalist, 맥시멀리즘 | emerging | practice | 컬러·패턴·요소를 과밀하게 채우고 중첩해 풍부함과 과잉을 미덕으로 삼는 스타일입니다. 여백과 절제를 추구하는 미니멀리즘의 반작용으로, 정보 명료성보다 강렬한 감각적 인상을 우선할 때 쓰는 태도 표현입니다. | 미니멀 피로 반작용, 강렬한 인상 | 정보 명료성·집중이 중요한 화면 | Reflow-Heavy |  | CSS Grid / background 패턴 / z-index | BentoGrid, CollageLayout | Collage Layout, Anti-design | Negative Space |
| editorial-revival | Editorial Revival | 에디토리얼 리바이벌 | Editorial Style, Print Revival, 에디토리얼 복고 | mainstream | practice | 드롭캡, 다단 흐름, 캡션, 넓은 여백 같은 인쇄 매거진 조판 문법을 웹으로 가져온 양식입니다. 한 칼럼에 본문을 단조롭게 흘리는 기본 문서 레이아웃과 달리 인쇄 지면의 위계와 리듬을 재현해 콘텐츠 권위와 읽는 경험을 강조할 때 씁니다. | 콘텐츠 권위, 읽는 경험 강조 | 기능·앱 중심 화면 | Reflow-Heavy | 45-75ch | column-count / ::first-letter / CSS Subgrid | Blockquote, Heading | Magazine Layout, Compound Grid |  |
| zine-look | Zine Look | 진 룩 | Zine Aesthetic, Punk Layout, 진 스타일 | experimental | practice | 컷앤스틱 조각과 펑크 타이포를 겹쳐 텍스트가 이미지를 덮고 침범하게 만드는 양식입니다. 텍스트와 이미지를 칸으로 분리하는 정형 레이아웃과 달리 의도적으로 층을 포개고 회전시켜 인디 잡지의 거친 무드를 내며, 반정형 표현을 노릴 때 씁니다. | 펑크·인디 무드, 반정형 표현 | 기업·신뢰 중심 브랜드 | Reflow-Heavy |  | position:absolute / transform:rotate / z-index | CollageLayout, OverlappingStack | Collage Layout, Deconstructed Grid |  |
| retrofuturism-y2k | Retrofuturism / Y2K | 레트로퓨처리즘 | Y2K Aesthetic, Retrofuturism, 레트로 퓨처 | emerging | practice | 크롬 질감, 그라데이션, 픽셀·치트한 UI 등 90s에서 00s 웹과 미래주의 모티프를 차용한 스타일입니다. 평평한 모던 미니멀 양식과 달리 광택과 장식 요소로 노스탤지어를 자극하며, 컬처 브랜드나 노스탤지어 타깃 캠페인에서 씁니다. | 노스탤지어 타깃, 컬처 브랜드 | 미니멀·전문성 중심 서비스 | Stack |  | linear-gradient / box-shadow inset / border | Marquee, GrainyGradient | Maximalism, Marquee/Ticker |  |
| imperfect-realism | Imperfect Realism | 불완전 사실주의 | Imperfect Design, 불완전 미학 | emerging | practice | 노이즈, 손맛, 비정형 마감 같은 의도적 거칠음을 살려 인간미를 강조하는 양식입니다. 균질하게 매끈한 AI 슬릭 마감의 피로에 대한 반작용으로, 정밀함이 신뢰의 핵심인 테크 브랜드보다 따뜻함과 진정성을 노리는 맥락에서 씁니다. | AI 슬릭 피로 반작용, 인간미 강조 | 정밀·테크 신뢰 중심 브랜드 | Stack |  | filter / mix-blend-mode / SVG noise | CollageLayout, GrainyGradient | Collage Layout |  |

### 22. Typographic & Geometric · 타이포·기하 표현

타이포그래피와 기하 요소 자체를 레이아웃의 주역으로 쓰는 표현.

| ID | Pattern | 한글 | Aliases | Maturity | Evidence | Description | Best For | Avoid For | Reflow | Build | Components | Good With | Avoid With |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| oversized-type | Oversized/Full-bleed Type | 오버사이즈 타이포 | Oversized Display, Big Type, 대형 타이포 | mainstream | practice | 텍스트를 화면 가장자리까지 꽉 채우는 거대 크기로 키워 타이포 자체를 주인공으로 쓰는 배치입니다. 본문급 글자에 이미지로 인상을 만드는 방식과 달리 글자 크기와 여백만으로 강렬한 첫인상과 브랜드 보이스를 전달하며, 히어로에서 씁니다. | 강렬한 첫인상, 브랜드 보이스 | 정보 밀집·긴 본문 | Stack | CSS / clamp() | Oversized Display, Exaggerated Hierarchy | Scale Contrast, Centered Hero |  |
| kinetic-type | Kinetic Typography Layout | 키네틱 타이포 | Animated Type, Motion Typography, 움직이는 타이포 | emerging | practice | 텍스트가 스크롤·호버·시간에 따라 움직이며 그 자체로 레이아웃을 구성하는 표현입니다. 정적으로 놓인 글자와 달리 모션이 위계와 흐름을 만들어 시선을 유도하며, 모션 중심 브랜드나 인터랙티브 히어로에서 씁니다. | 모션 중심 브랜드, 인터랙티브 히어로 | 가독성·접근성 민감 콘텐츠 | Stack | animation / transform / GSAP / JS | KineticTypography, FlipWords, TextScramble | Video / Animated Hero |  |
| marquee-ticker | Marquee / Ticker | 마퀴 | Marquee, Ticker, 흐르는 띠 | emerging | practice | 텍스트나 로고를 가로로 무한히 반복 스크롤시키는 흐르는 띠입니다. 한 줄에 정적으로 나열하는 방식과 달리 끊임없는 움직임으로 반복 강조와 리듬을 만들며, 레트로·브루탈 무드나 로고 클라우드에서 씁니다. | 강조 반복, 레트로·브루탈 무드 | 정적 신뢰·집중 콘텐츠 | Stack | animation / transform:translateX / keyframes | Marquee | Brutalism / Neo-brutalism, Logo Cloud |  |
| infinite-canvas | Infinite Canvas | 인피니트 캔버스 | Infinite Canvas, Endless Canvas, 무한 캔버스 | experimental | practice | 화면 경계 없이 끝없이 펼쳐지는 평면을 드래그·줌으로 탐색하는 공간형 구조입니다. 위에서 아래로 흐르는 선형 스크롤과 달리 2차원 자유 이동으로 탐색하게 해, 탐색형 포트폴리오나 인터랙티브 맵처럼 비선형 발견이 콘셉트일 때 씁니다. | 탐색형 포트폴리오, 인터랙티브 맵 | 명확한 선형 탐색·표준 기대 | Reflow-Heavy | transform:translate / pointer events / Scroll API | HorizontalScroll, ScrollSnap | Multi-directional Scroll |  |
| experimental-nav | Experimental Navigation | 실험적 내비게이션 | Unconventional Nav, 실험적 내비 | experimental | practice | 내비게이션을 헤더에 모으지 않고 화면 곳곳에 흩어 배치해 레이아웃과 탐색의 경계를 허무는 비관습 구조입니다. 예측 가능한 표준 내비와 달리 탐색 행위 자체를 경험으로 만들어, 아트 사이트나 개성 강한 포트폴리오에서 씁니다. | 아트 사이트, 개성 강한 포트폴리오 | 효율·발견성이 중요한 서비스 | Reflow-Heavy | position:absolute / transform / JS | NavigationMenu, HorizontalScroll | Infinite Canvas, Deconstructed Grid | Documentation Layout |
