/* portfolio의 Fullpage 효과 */
const pages = document.querySelectorAll('.page');
let currentPage = 0;
let isPageScrolling = false;

/* 모바일/태블릿 여부: 이 폭 이하에서는 네이티브 스크롤 + 커스텀 커서 비활성화 */
const MOBILE_BP = 1024;
const isMobile = () => window.innerWidth <= MOBILE_BP;

document
  .querySelector('.main-project-container')
  .addEventListener('scroll', mainProjectContainerScroll);

function mainProjectContainerScroll() {
  if (this.scrollTop + window.innerHeight === this.scrollHeight) {
    window.removeEventListener('scroll', mainProjectContainerScroll);
    window.addEventListener('wheel', wheelEvent, { passive: false });
  } else if (this.scrollTop === 0) {
    window.addEventListener('wheel', wheelEvent, { passive: false });
    window.removeEventListener('scroll', mainProjectContainerScroll);
  }
}
function wheelEvent(e) {
  if (isMobile()) return; // 모바일/태블릿: 네이티브 스크롤 사용
  if (isPageScrolling) return;

  e.preventDefault(); // 기본 스크롤 방지
  isPageScrolling = true;

  if (e.deltaY >= 0 && currentPage < pages.length - 1) {
    currentPage++; // 다음 페이지로 이동
  } else if (e.deltaY < 0 && currentPage > 0) {
    currentPage--; // 이전 페이지로 이동
  }

  if (currentPage === 3) {
    window.removeEventListener('wheel', wheelEvent);
  }

  const targetScroll = currentPage * window.innerHeight;

  smoothScrollTo(targetScroll, () => {
    isPageScrolling = false; // 스크롤 잠금 해제
  });
}
window.addEventListener('wheel', wheelEvent, { passive: false });

function smoothScrollTo(target, callback) {
  const start = window.scrollY;
  const distance = target - start;
  const duration = 500; // 애니메이션 지속 시간 (ms)
  let startTime = null;

  function animation(currentTime) {
    if (!startTime) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1); // 진행률 계산

    window.scrollTo(0, start + distance * easeInOutQuad(progress));

    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    } else {
      callback(); // 애니메이션 종료 후 콜백 실행
    }
  }

  requestAnimationFrame(animation);
}

// 부드러운 가속/감속을 위한 easing 함수
function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/* portfolio의 cursor 효과 */
const mainCursor = document.querySelector('.cursor.main');
const subCursor = document.querySelector('.cursor.sub');

// 마우스 움직임에 따라 커서를 이동시키는 함수
function moveCursor(e) {
  if (isMobile() || !mainCursor) return; // 모바일: 커스텀 커서 비활성화
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  // 메인 커서 위치 업데이트
  mainCursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;

  // 서브 커서 위치 업데이트
  // subCursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
}

// 마우스 움직임 이벤트 리스너 추가
window.addEventListener('mousemove', moveCursor);

/* portfolio의 hover 효과 */
const lamp3d = document.querySelector('.lamp-3d');
const hoverText = document.querySelector('.hover-text');
let timeout;

// 마우스가 lamp-3d 위로 올라왔을 때
lamp3d.addEventListener('mouseenter', () => {
  hoverText.style.opacity = '1';
  clearTimeout(timeout); // 기존 타이머 취소 

  // 타이머 설정
  timeout = setTimeout(() => {
    hoverText.style.opacity = '0';
  }, 2500); 
});

// 마우스가 lamp-3d를 떠났을 때
lamp3d.addEventListener('mouseleave', () => {
  hoverText.style.opacity = '0'; 
  clearTimeout(timeout); // 타이머 초기화
});



/* #### section: loading-page #### */
document.addEventListener("DOMContentLoaded", () => {
  const loadingPage = document.getElementById("loading-page");
  const loadingBar = document.getElementById("loading-bar");
  const loadingText = document.getElementById("loading-text");

  let progress = 0;

  // 로컬 스토리지에서 로딩 상태 확인
  const hasVisited = localStorage.getItem("hasVisited");

  if (!hasVisited) {
    // 처음 방문한 경우 로딩 페이지 표시
    localStorage.setItem("hasVisited", "true"); // 방문 기록 저장

    // 진행 상황 업데이트 함수
    const updateProgress = () => {
      if (progress < 100) {
        progress += Math.random() * 10; // 랜덤하게 진행 증가
        if (progress > 100) progress = 100;

        loadingBar.style.width = `${progress}%`;
        loadingText.textContent = `Portfolio Loading... ${Math.floor(progress)}%`;

        setTimeout(updateProgress, Math.random() * (300 - 100) + 100); // 랜덤 시간 간격
      } else {
        // 로딩 완료 처리
        setTimeout(() => {
          loadingPage.style.opacity = "0";
          setTimeout(() => {
            loadingPage.style.display = "none";
          }, 500); // 페이드아웃 시간
        }, 500);
      }
    };

    updateProgress();
  } else {
    // 이미 방문한 경우 로딩 페이지 숨기기
    loadingPage.style.display = "none";
  }
});



/* nav Fetch */
// nav.html 파일을 fetch로 가져와서 index.html에 삽입
fetch('./html/nav.html') // nav.html 경로
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.text(); // HTML 내용을 텍스트로 변환
  })
  .then((data) => {
    document.getElementById('nav-container').innerHTML = data; // nav-container에 삽입

    /* nav */
    const navigation = document.getElementById('main-navigation'); // 네비게이션 메뉴
    const toggleIcon = document.getElementById('toggle-icon'); // 토글 아이콘(이미지)
    const toggleBtn = document.getElementById('nav-toggle'); // 토글 버튼

    // 네비게이션 열림/닫힘 상태를 보조기술에 전달
    function syncNavAria() {
      const opened = !navigation.classList.contains('hidden');
      toggleBtn.setAttribute('aria-expanded', String(opened));
      toggleBtn.setAttribute('aria-label', opened ? '메뉴 닫기' : '메뉴 열기');
    }
    const accessoriesText = document.querySelector('.accessories-text'); // accessories-text
    const numbering = document.querySelector('.numbering'); // numbering

    let isLastPage = false; // 현재 마지막 페이지 여부를 추적

    toggleBtn.addEventListener('click', function () {
      // 네비게이션 메뉴 숨기기/보이기
      navigation.classList.toggle('hidden');
      syncNavAria();

      // 네비게이션 활성화 시 accessories-text, numbering, accessories-circle 숨기기
      if (!navigation.classList.contains('hidden')) {
        accessoriesText.style.display = 'none';
        numbering.style.display = 'none';

        // accessories-circle 숨기기
        document.querySelector('.accessories-circle-01').style.display = 'none';
        document.querySelector('.accessories-circle-02').style.display = 'none';

        // X 아이콘으로 전환
        toggleIcon.src = 'images/nav/x-icon.png';
      } else {
        accessoriesText.style.display = 'block';
        numbering.style.display = 'block';

        // accessories-circle 다시 표시
        document.querySelector('.accessories-circle-01').style.display =
          'block';
        document.querySelector('.accessories-circle-02').style.display =
          'block';

        // 마지막 페이지인지 확인 후 아이콘 설정
        if (isLastPage) {
          toggleIcon.src = 'images/nav/hamburger-icon_wh.png'; // 흰색 햄버거 아이콘 유지
        } else {
          toggleIcon.src = 'images/nav/hamburger-icon.png'; // 기본 햄버거 아이콘 복원
        }
      }
    });

    /* 네비게이션 링크 클릭 시 자동 닫기 */
    document.querySelectorAll('.navigation-title a').forEach((link) => {
      link.addEventListener('click', () => {
        // 네비게이션 닫기
        navigation.classList.add('hidden');
        syncNavAria();

        // accessories-text, numbering, accessories-circle 다시 표시
        accessoriesText.style.display = 'block';
        numbering.style.display = 'block';
        document.querySelector('.accessories-circle-01').style.display =
          'block';
        document.querySelector('.accessories-circle-02').style.display =
          'block';

        // 마지막 페이지인지 확인 후 아이콘 설정
        if (isLastPage) {
          toggleIcon.src = 'images/nav/hamburger-icon_wh.png'; // 흰색 햄버거 아이콘 유지
        } else {
          toggleIcon.src = 'images/nav/hamburger-icon.png'; // 기본 햄버거 아이콘 복원
        }
      });
    });

    /* nav 페이지 업데이트 */
    const pageNumberElement = document.getElementById('page-number'); // 페이지 번호 요소
    const pages = document.querySelectorAll('.page'); // 모든 페이지 섹션
    let currentPage = 0; // 현재 페이지 초기값

    // 스크롤 이벤트 추가
    window.addEventListener('scroll', () => {
      // 현재 스크롤 위치를 기준으로 페이지 계산
      const newPage = Math.round(window.scrollY / window.innerHeight);

      if (newPage !== currentPage) {
        currentPage = newPage; // 현재 페이지 업데이트
        updatePageNumber(currentPage + 1); // 페이지 번호 업데이트

        // 마지막 페이지(8페이지)인지 확인하여 스타일 변경 적용
        if (currentPage + 1 === 8) {
          isLastPage = true; // 마지막 페이지 상태 저장
          applyLastPageStyles(); // 마지막 페이지 스타일 적용
        } else {
          isLastPage = false; // 마지막 페이지 상태 해제
          resetStyles(); // 기본 스타일로 복원
        }
      }
    });

    // 페이지 번호 업데이트 함수
    function updatePageNumber(page) {
      pageNumberElement.textContent = page.toString().padStart(2, '0');
    }

    // 마지막 페이지 스타일 적용 함수
    function applyLastPageStyles() {
      const toggleIcon = document.getElementById('toggle-icon');

      toggleIcon.src = 'images/nav/hamburger-icon_wh.png';
      navigation.style.backgroundColor = 'var(--light-black)';
      accessoriesText.style.color = 'var(--dim-gray)';
      const accessoriesTextBefore = document.querySelector('.accessories-text');
      accessoriesTextBefore.style.setProperty('--before-color', 'var(--white)');
      const numbering = document.querySelector('.numbering');
      numbering.style.color = 'var(--silver-gray)';
    }

    // 기본 스타일로 복원하는 함수
    function resetStyles() {
      const toggleIcon = document.getElementById('toggle-icon');
      
      if (document.querySelector('.navigation').classList.contains('hidden')) {
        toggleIcon.src = 'images/nav/hamburger-icon.png';
      } else {
        toggleIcon.src = 'images/nav/x-icon.png';
      }
      
      navigation.style.backgroundColor = 'var(--MainBlue)';
      accessoriesText.style.color = 'var(--dim-black)';
      const accessoriesTextBefore = document.querySelector('.accessories-text');
      accessoriesTextBefore.style.setProperty(
        '--before-color',
        'var(--MainBlue)'
      );
      const numbering = document.querySelector('.numbering');
      numbering.style.color = 'var(--MainBlue)';
    }
  })
  .catch((error) => {
    console.error('Error fetching nav.html:', error); // 에러 처리
  });

/* #### section: main-page #### */
/* point-text */
const textElements = gsap.utils.toArray('.point-text');

// 각 요소에 애니메이션 적용
textElements.forEach((el, index) => {
  if (el.tagName === 'P') {
    // p 태그의 텍스트를 줄 단위로 분리
    const lines = el.innerHTML.split('<br>');
    el.innerHTML = '';

    // 각 줄을 span 태그로 감싸기
    lines.forEach((line, i) => {
      const span = document.createElement('span');
      span.classList.add('point-line');
      span.innerHTML = line.trim(); // 공백 제거 후 추가
      el.appendChild(span);

      // <br> 추가 (마지막 줄 제외)
      if (i < lines.length - 1) {
        el.appendChild(document.createElement('br'));
      }
    });

    // 각 줄에 애니메이션 적용
    const lineElements = el.querySelectorAll('.point-line');
    lineElements.forEach((lineEl, lineIndex) => {
      gsap.to(lineEl, {
        duration: 3,
        delay: index * 0.3 + lineIndex * 1,
        ease: 'power2.out', // 부드러운 전환 효과
        color: 'var(--dim-black)',
      });
    });
  } else if (el.tagName === 'H2') {
    // h2 태그의 기본 애니메이션 적용
    gsap.to(el, {
      duration: 1.5,
      delay: index * 0.7,
      ease: 'power2.out',
      color: 'var(--dark-black)',
    });

    // h2 내부의 특정 강조 텍스트에 별도 애니메이션 적용
    const highlight = el.querySelector('.highlight');
    if (highlight) {
      gsap.to(highlight, {
        duration: 1.5,
        delay: index * 0.7 + 0.5,
        ease: 'power2.out',
        color: 'var(--MainYellow)',
      });
    }
  }
});

/* main-project-content */
let debounceTimer;
document.getElementById('main-project').addEventListener('scroll', function () {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const mainProject = this;

    if (
      mainProject.scrollTop + mainProject.clientHeight >=
      mainProject.scrollHeight
    ) {
      document
        .getElementById('sub-project')
        .scrollIntoView({ behavior: 'smooth' });
    }
  }, 100000000); // 호출 방지
});
// content-2,content-3
let index = 0,
  interval = 1000;

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const animate = (star) => {
  star.style.setProperty('--star-left', `${rand(-10, 100)}%`);
  star.style.setProperty('--star-top', `${rand(-40, 80)}%`);

  star.style.animation = 'none';
  star.offsetHeight;
  star.style.animation = '';
};

for (const star of document.getElementsByClassName('magic-star')) {
  setTimeout(() => {
    animate(star);

    setInterval(() => animate(star), 2000);
  }, index++ * (interval / 3));
}



/* #### section: about-me #### */
let aboutMeAnimated = false;
function triggerAnimation() {
  if (aboutMeAnimated) return;
  const section = document.querySelector('#about-me');
  if (!section) return;

  const rect = section.getBoundingClientRect();

  // 섹션이 뷰포트 안에 들어왔을 때 (1회만 실행 — 스크롤마다 재실행되던 깜빡임 제거)
  if (rect.top <= window.innerHeight * 0.85 && rect.bottom >= 0) {
    aboutMeAnimated = true;
    // 카드 요소만 순차적으로 등장
    const cards = section.querySelectorAll(
      '.chaea, .blue-bg, .ticket, .post, .paper, .book, .floppy-disk'
    );
    cards.forEach((el, index) => {
      setTimeout(() => el.classList.add('animate'), index * 150);
    });
    window.removeEventListener('scroll', triggerAnimation);
  }
}

// 스크롤 + 로드 시 섹션 상태 확인
window.addEventListener('scroll', triggerAnimation);
window.addEventListener('load', triggerAnimation);




/* #### section: skill #### */
('use strict');
window.addEventListener('DOMContentLoaded', () => {
  const rockerSwitch = new RockerSwitch('#switch-toggle');
  const skillBars = document.querySelectorAll('.skill-bar');
});

class RockerSwitch {
  constructor(buttonEl) {
    var _a;
    this._switchState = 'off'; // 초기 상태: "off"
    this.button = document.querySelector(buttonEl);
    (_a = this.button) === null || _a === void 0
      ? void 0
      : _a.addEventListener('click', this.toggleSwitch.bind(this));
  }

  //스위치 상태 설정
  get switchState() {
    return this._switchState;
  }
  set switchState(value) {
    var _a;
    this._switchState = value;
    (_a = this.button) === null || _a === void 0
      ? void 0
      : _a.setAttribute('aria-labelledby', this._switchState);
  }
  //스위치 상태를 토글
  toggleSwitch() {
    this.switchState = this.switchState === 'c' ? 'f' : 'c';
  }
}
// skill-bar
('use strict');

window.addEventListener('DOMContentLoaded', () => {
  const switchButton = document.querySelector('#switch-toggle');
  const skillBars = document.querySelectorAll('.skill-bar');

  // 초기 상태 설정: 스킬바 숨김, 스위치 버튼은 '오프' 상태
  skillBars.forEach((bar) => {
    bar.classList.remove('visible');
  });
  switchButton.setAttribute('aria-labelledby', 'f'); // 초기 상태를 '오프'로 설정

  // 스위치 버튼 클릭 이벤트 추가
  switchButton.addEventListener('click', () => {
    const isOff = switchButton.getAttribute('aria-labelledby') === 'f'; // 현재 상태가 '오프'인지 확인

    // 상태에 따라 skill-bar 표시/숨김 처리
    skillBars.forEach((bar) => {
      if (isOff) {
        bar.classList.add('visible'); // '온' 상태에서 스킬바 표시
      } else {
        bar.classList.remove('visible'); // '오프' 상태에서 스킬바 숨김
      }
    });

    // 스위치 상태 토글
    switchButton.setAttribute(
      'aria-labelledby',
      isOff ? 't' : 'f' // '오프' -> '온', '온' -> '오프'
    );
  });
});

//skill-popup
const skills = [
  {
    id: 1,
    data: 'html',
    name: 'HTML5',
    rate: 98,
    image: 'images/subsection_02/skillIcon-01.png',
    desc: 'HTML5를 활용한 웹페이지 구조 설계에 능숙합니다.<br> 시맨틱 마크업을 준수하며 시맨틱 마크업 등 최적화된 코드를 작성할 수 있습니다.<br> 다양한 브라우저 호환성을 고려한 코딩이 가능합니다.',
  },
  {
    id: 2,
    data: 'css',
    name: 'CSS',
    rate: 90,
    image: 'images/subsection_02/skillIcon-02.png',
    desc: 'CSS를 사용하여 웹사이트 스타일링에 능숙합니다.<br>Flexbox와 Grid를 활용한 반응형 디자인을 구현할 수 있습니다.<br>애니메이션과 트랜지션을 통해 생동감 있는 인터페이스를 제작할 수 있습니다.<br>',
  },
  {
    id: 3,
    data: 'scss',
    name: 'Sass / SCSS',
    rate: 90,
    image: 'images/subsection_02/skillIcon-03.png',
    desc: 'Sass/SCSS를 활용한 효율적인 스타일 코드 작성에 능숙합니다.<br>변수, 믹스인을 통해 유지보수성과 재사용성을 극대화합니다.<br>팀 프로젝트의 스타일 설계 경험이 있습니다.<br>',
  },
  {
    id: 4,
    data: 'js',
    name: 'JavaScript',
    rate: 88,
    image: 'images/subsection_02/skillIcon-04.png',
    desc: 'JavaScript를 사용한 동적 웹 기능 구현에 능숙합니다.<br>DOM 조작, 이벤트 처리를 통한 비동기 작업이 가능합니다.<br>기본적인 ES6 문법과 모듈화를 활용한 코드 작성 경험이 있습니다.<br>',
  },
  {
    id: 5,
    data: 'react',
    name: 'React',
    rate: 80,
    image: 'images/subsection_02/skillIcon-05.png',
    desc: 'React를 사용한 컴포넌트 기반 개발에 능숙합니다.<br>Props와 State를 효과적으로 관리하여 UI를 동적으로 업데이트할 수 있습니다.<br>React Router와 Redux 등 주요 라이브러리를 사용할 수 있습니다.<br>',
  },
  {
    id: 6,
    data: 'vscode',
    name: 'VS CODE',
    rate: 98,
    image: 'images/subsection_02/skillIcon-10.png',
    desc: 'VS Code를 활용한 효율적인 코딩 환경 설정에 능숙합니다.<br>확장 프로그램을 사용하여 생산성을 극대화합니다.<br>Git과 연동하여 협업 작업을 원활히 진행할 수 있습니다.<br>',
  },
  {
    id: 7,
    data: 'github',
    name: 'GitHub',
    rate: 95,
    image: 'images/subsection_02/skillIcon-11.png',
    desc: 'GitHub를 사용한 프로젝트 관리와 협업에 능숙합니다.<br>브랜치 전략을 통해 효율적인 팀 개발을 진행할 수 있습니다.<br>코드 리뷰와 이슈 관리를 통해 프로젝트 품질을 유지합니다.<br>',
  },
  {
    id: 8,
    data: 'netlify',
    name: 'Netlify',
    rate: 92,
    image: 'images/subsection_02/skillIcon-12.png',
    desc: 'Netlify를 활용한 빠르고 안정적인 웹사이트 배포 경험이 있습니다.<br>사용자 도메인을 연결하고 HTTPS 인증서를 발급한 경험이 있습니다.<br>',
  },
  {
    id: 9,
    data: 'excel',
    name: 'Microsoft Excel',
    rate: 87,
    image: 'images/subsection_02/skillIcon-13.png',
    desc: 'Excel을 사용하여 데이터 분석과 통계 작업에 능숙합니다.<br>피벗 테이블, 수식 작성, 매크로 기능을 사용할 수 있습니다.<br>데이터 시각화와 보고서 작성 경험이 있습니다.<br>',
  },
  {
    id: 10,
    data: 'powerpoint',
    name: 'Microsoft PowerPoint',
    rate: 90,
    image: 'images/subsection_02/skillIcon-14.png',
    desc: 'PowerPoint를 활용한 효과적인 발표 자료 제작에 능숙합니다.<br>시각적 디자인 원칙을 적용하여 자료의 전달력을 높입니다.<br>애니메이션과 트랜지션을 활용해 동적인 슬라이드를 제작할 수 있습니다.<br>',
  },
  {
    id: 11,
    data: 'hwp',
    name: 'HWP',
    rate: 90,
    image: 'images/subsection_02/skillIcon-15.png',
    desc: '한글 프로그램을 사용하여 문서 작성과 편집에 능숙합니다.<br>표, 도형, 이미지 삽입을 통해 가독성 높은 문서를 작성할 수 있습니다.<br>스타일과 템플릿 설정을 통한 효율적인 작업 경험이 있습니다.<br>',
  },
  {
    id: 12,
    data: 'figma',
    name: 'Figma',
    rate: 90,
    image: 'images/subsection_02/skillIcon-06.png',
    desc: 'Figma를 사용하여 사용자 인터페이스 및 프로토타입 제작에 능숙합니다.<br>팀 협업을 위해 실시간 코멘트와 수정 작업을 진행할 수 있습니다.<br>플러그인을 활용하여 작업 효율을 높인 경험이 있습니다.<br>',
  },
  {
    id: 13,
    data: 'illustrator',
    name: 'Adobe Illustrator',
    rate: 98,
    image: 'images/subsection_02/skillIcon-07.png',
    desc: 'Illustrator를 사용하여 벡터 디자인 작업에 능숙합니다.<br>로고, 아이콘, 일러스트 제작 경험이 풍부합니다.<br>색상 관리와 레이어 작업을 통한 정교한 작업이 가능합니다.<br>',
  },
  {
    id: 14,
    data: 'photoshop',
    name: 'Adobe Photoshop',
    rate: 88,
    image: 'images/subsection_02/skillIcon-08.png',
    desc: 'Photoshop을 사용하여 이미지 편집과 합성에 능숙합니다.<br>레이어 마스크와 필터를 활용한 정교한 작업이 가능합니다.<br>웹용 그래픽 디자인 및 사진 보정 경험이 있습니다.<br>',
  },
  {
    id: 15,
    data: 'indesign',
    name: 'Adobe InDesign',
    rate: 80,
    image: 'images/subsection_02/skillIcon-09.png',
    desc: 'InDesign을 사용하여 출판물 디자인에 능숙합니다.<br>레이아웃 설정과 스타일 가이드를 기반으로 작업합니다.<br>다페이지 문서 편집과 출력 최적화 경험이 있습니다.<br>',
  },
  {
    id: 16,
    data: 'gpt',
    name: 'Chat GPT',
    rate: 92,
    image: 'images/subsection_02/skillIcon-16.png',
    desc: 'ChatGPT를 사용하여 문서 작성, 정보 검색, 아이디어 브레인스토밍에 능숙합니다.<br>대화형으로 문제를 해결하거나 학습 자료를 생성할 수 있습니다.<br>다양한 언어와 분야에 걸친 지원이 가능합니다.<br>',
  },
  {
    id: 17,
    data: 'perplexity',
    name: 'Perplexity',
    rate: 98,
    image: 'images/subsection_02/skillIcon-17.png',
    desc: 'Perplexity를 활용한 고급 정보 검색과 분석에 능숙합니다.<br>복잡한 질문에 대해 심층적인 답변을 제공할 수 있습니다.<br>여러 소스를 비교하여 신뢰도 높은 정보를 도출합니다.<br>',
  },
];

let timer; // 타이머 변수 선언

const skillItem = document.querySelectorAll('.skill-item');
const skillPopup = document.querySelector('.skill-popup'); // 팝업 요소 선택

skillItem.forEach((icon) => {
  icon.addEventListener('click', () => {
    const iconData = icon.getAttribute('data-icon'); // 클릭한 아이콘의 data-icon 값 가져오기
    skillPopup.innerHTML = ''; // 팝업 초기화

    skills.forEach((skill) => {
      if (skill.data === iconData) {
        // 일치하는 스킬 데이터 찾기
        let createDiv = document.createElement('div');
        createDiv.innerHTML = `
          <div class="popup-icon">
            <img src="${skill.image}" alt="${skill.name}">
            <span>${skill.name}</span>
            <p>${skill.rate}%</p>
          </div>
          <div class="skill-rate">
            <div class="skill-rate-percent" style="width: 0%;"></div>
          </div>
          <span class="skill-desc">
            <p>${skill.desc}</p>
          </span>
          <button class="popup-close"><img src="images/subsection_02/close.png" alt="닫기"></button>
        `;
        createDiv.classList.add('popup-wrap');
        skillPopup.appendChild(createDiv);
        skillPopup.classList.add('active');

        // 게이지 애니메이션 설정
        if (timer) {
          clearTimeout(timer); // 이전 타이머 제거
        }
        timer = setTimeout(() => {
          const skillRatePercent = document.querySelector(
            '.skill-rate-percent'
          );
          if (skillRatePercent) {
            skillRatePercent.style.width = `${skill.rate}%`; // 게이지 너비 설정
          }
        }, 100); // 약간의 지연 후 실행

        // 팝업 닫기 버튼 처리
        const popupClose = document.querySelector('.popup-close');
        popupClose.addEventListener('click', () => {
          skillPopup.classList.remove('active'); // 팝업 닫기
        });

        // 팝업 외부 클릭 시 닫기
        skillPopup.addEventListener('click', (event) => {
          if (event.target === skillPopup) {
            skillPopup.classList.remove('active');
          }
        });
      }
    });
  });
});

/* #### section: main-project #### */
/* main-project-link */
document.querySelectorAll('.main-project-link .link').forEach((button) => {
  // 버튼의 텍스트를 분리하여 각 문자마다 <span> 태그로 감싸기
  button.innerHTML =
    '<div><span>' +
    button.textContent.trim().split('').join('</span><span>') +
    '</span></div>';

  // 클릭 이벤트 추가
  button.addEventListener('click', () => {
    const url = button.getAttribute('data-href');
    if (url) {
      window.open(url, '_blank'); // 새 탭에서 열기
    }
  });
});

/* scroll-item */
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.transitionDuration = '1s'; // 전환 시간을 동적으로 설정
      entry.target.classList.add('active');
    }
  });
});

// 모든 scroll-item 요소를 관찰
document
  .querySelectorAll('.scroll-item')
  .forEach((item) => observer.observe(item));

/* #### section: sub-project #### */
document.addEventListener('DOMContentLoaded', () => {
  const contents = document.querySelectorAll('.sub-project-left-content');
  const listItems = document.querySelectorAll('.sub-project-right ul li');
  const subProject = document.querySelector('.sub-project');
  let currentSubProjectIndex = 0; // 현재 표시 중인 인덱스

  const backgroundColors = {
    class101: '#6A5ACD',
    blisse: '#38B2AC',
    homeCheck: '#4CAF50',
    PetStory: '#D2B48C',
    MovieBox: '#708090',
    agency: '#5AA9E6',
  };

  // 콘텐츠를 표시하는 함수
  const showContent = (index) => {
    contents.forEach((content) => content.classList.remove('active'));
    listItems.forEach((item) => item.classList.remove('active'));

    contents[index].classList.add('active');
    listItems[index].classList.add('active');

    // 배경색 변경
    const sectionClass = Array.from(contents[index].classList).find((cls) =>
      Object.keys(backgroundColors).includes(cls)
    );
    if (sectionClass) {
      subProject.style.setProperty(
        '--background-color',
        backgroundColors[sectionClass]
      );
    }

    // 현재 인덱스를 업데이트
    currentSubProjectIndex = index;
  };

  // 자동 전환 기능
  const autoSwitch = () => {
    showContent(currentSubProjectIndex);
    currentSubProjectIndex = (currentSubProjectIndex + 1) % contents.length;
  };

  // 첫 번째 콘텐츠 표시
  autoSwitch();

  // 매 2.5초마다 콘텐츠 변경
  let interval = setInterval(autoSwitch, 2500);

  // 리스트 마우스오버 이벤트
  listItems.forEach((item, index) => {
    item.addEventListener('mouseover', () => {
      clearInterval(interval); // 자동 전환 멈춤
      showContent(index); // 해당 콘텐츠 표시
    });

    item.addEventListener('mouseout', () => {
      interval = setInterval(autoSwitch, 2500); // 자동 전환 재개
    });
  });
});

/* #### section: minigame-project #### */
// 초기 상태에서 .a는 flex: 5로 설정
/* 
  const cardGame = document.querySelector('.minigame .card-game');
  const otherGames = document.querySelectorAll('.minigame div:not(.card-game)');
  
  // 초기 flex 설정
  cardGame.style.flex = '5';
  
  // 다른 div들에 마우스 호버 이벤트 추가
  otherGames.forEach(div => {
    div.addEventListener('mouseenter', () => {
      cardGame.style.flex = '1';
      div.style.flex = '5';
    });
  
    div.addEventListener('mouseleave', () => {
      // 호버가 끝나면 다시 모든 div를 기본 상태로 복구
      cardGame.style.flex = '5';
      div.style.flex = '1';
    });
  }); 
  */

/* #### section: design #### */
const designImg = document.querySelector('.design-img-wrapper');
const designImgItems = Array.from(designImg.children); // 이미지 아이템 배열로 변환
let currentSlideIndex = 0; // 변수 이름 변경

// 디자인 타이틀 요소 선택
const designTitle = document.querySelector('.design-title');
const designNameH3 = designTitle.querySelector('.desgin-name h3');
const designNameH2 = designTitle.querySelector('.desgin-name h2');
const designSubtitleH5 = designTitle.querySelector('.design-sub');

// 슬라이드별 텍스트 데이터
const slideData = [
  { number: '01', title: 'Brand Design', subtitle: '손의손' },
  { number: '02', title: 'Leaflet Design', subtitle: '러쉬' },
  { number: '03', title: 'MiniBook Design', subtitle: '02:24' },
  { number: '04', title: 'Magazine Design', subtitle: '조말론' },
  { number: '05', title: 'Poster Design', subtitle: '크루엘라' },
  {
    number: '06',
    title: 'BookCover Design',
    subtitle: '어서오세요 휴담동서점입니다.',
  },
  { number: '07', title: 'Logo Design', subtitle: '도담종합건설' },
  { number: '08', title: 'GuideBook Design', subtitle: '오늘은 후쿠오카' },
  { number: '09', title: 'Poster Design', subtitle: 'DMF' },
  { number: '10', title: 'Poster Design', subtitle: '시인의바다' },
  { number: '11', title: 'Brand Design', subtitle: 'JSPARK' },
  { number: '12', title: 'Banner Design', subtitle: '더다믐' },
  { number: '13', title: 'Logo Design', subtitle: 'PLAY' },
  { number: '14', title: 'RecipeBook Design', subtitle: '자취생의 집밥' },
  { number: '15', title: 'Poster Design', subtitle: '크루아상포레' },
  { number: '16', title: 'MenuBoard Design', subtitle: '범가네' },
  { number: '17', title: 'Brochure Design', subtitle: '훼미리푸드' },
  { number: '18', title: 'MenuBoard Design', subtitle: '털보네바베큐' },
  { number: '19', title: 'Banner Design', subtitle: '아르케' },
  { number: '20', title: 'Logo Design', subtitle: 'DINO' },
  { number: '21', title: 'Banner Design', subtitle: '호박꽃마차' },
  { number: '22', title: 'Poster Design', subtitle: 'E-Sports' },
];

// 캐러셀 업데이트 함수
function updateCarousel() {
  const positions = [
    { className: 'design-img-far-left-10' },
    { className: 'design-img-far-left-9' },
    { className: 'design-img-far-left-8' },
    { className: 'design-img-far-left-7' },
    { className: 'design-img-far-left-6' },
    { className: 'design-img-far-left-5' },
    { className: 'design-img-far-left-4' },
    { className: 'design-img-far-left-3' },
    { className: 'design-img-far-left-2' },
    { className: 'design-img-far-left-1' },
    { className: 'design-img-left' },
    { className: 'design-img-center' }, // 센터 상태
    { className: 'design-img-right' },
    { className: 'design-img-far-right-1' },
    { className: 'design-img-far-right-2' },
    { className: 'design-img-far-right-3' },
    { className: 'design-img-far-right-4' },
    { className: 'design-img-far-right-5' },
    { className: 'design-img-far-right-6' },
    { className: 'design-img-far-right-7' },
    { className: 'design-img-far-right-8' },
    { className: 'design-img-far-right-9' },
  ];

  designImgItems.forEach((item, index) => {
    item.className = 'design-img-item'; // 기존 클래스 초기화
    const positionIndex =
      (index - currentSlideIndex + designImgItems.length) %
      designImgItems.length; // 위치 계산

    if (positions[positionIndex]) {
      item.classList.add(positions[positionIndex].className); // 위치에 맞는 클래스 추가
      if (positions[positionIndex].className === 'design-img-center') {
        // 센터에 도달한 경우 텍스트 업데이트
        updateText(index);
      }
    }
  });
}

// 텍스트 업데이트 함수
function updateText(index) {
  const currentSlideData = slideData[index];
  if (currentSlideData) {
    designNameH3.textContent = currentSlideData.number;
    designNameH2.textContent = currentSlideData.title;
    designSubtitleH5.textContent = currentSlideData.subtitle;
  }
}

// 다음 슬라이드로 이동
function moveNext() {
  currentSlideIndex = (currentSlideIndex + 1) % designImgItems.length;
  updateCarousel();
}

// 이전 슬라이드로 이동
function movePrev() {
  currentSlideIndex =
    (currentSlideIndex - 1 + designImgItems.length) % designImgItems.length;
  updateCarousel();
}

let startX = 0; // 드래그 시작 X 좌표 초기화
let isDragging = false; // 드래그 상태 플래그

// 마우스 드래그 시작 이벤트
document.querySelector('.design-img-container');
document.addEventListener('mousedown', (e) => {
  if (isMobile()) return;
  isDragging = true;
  startX = e.clientX;
  e.preventDefault();
});

// 마우스 이동 이벤트 핸들러
document.addEventListener('mousemove', (e) => {
  if (isMobile()) return;
  if (!isDragging) return;
  const diff = e.clientX - startX;
  if (diff > 100) {
    movePrev();
    isDragging = false;
  } else if (diff < -100) {
    moveNext();
    isDragging = false;
  }
});

// 마우스 드래그 종료 이벤트 핸들러
document.addEventListener('mouseup', () => {
  isDragging = false;
});

// 터치 시작 이벤트 핸들러
document.querySelector('.design-img-container');
document.addEventListener('touchstart', (e) => {
  if (isMobile()) return; // 모바일: 네이티브 가로 스크롤 사용 (캐러셀 드래그 비활성화)
  isDragging = true;
  startX = e.touches[0].clientX;
});

// 터치 이동 이벤트 핸들러
document.addEventListener('touchmove', (e) => {
  if (isMobile()) return; // 모바일: 스와이프가 네이티브 스크롤을 끊지 않도록
  if (!isDragging) return;
  const diff = e.touches[0].clientX - startX;
  if (diff > 100) {
    movePrev();
    isDragging = false;
  } else if (diff < -100) {
    moveNext();
    isDragging = false;
  }
});

// 터치 종료 이벤트 핸들러
document.addEventListener('touchend', () => {
  isDragging = false;
});

updateCarousel();

if (!isMobile()) {
  setInterval(moveNext, 5000); // 자동 슬라이드 설정 (모바일에선 네이티브 스크롤 사용)
}

/* #### section: contact #### */
/* contact contact me이메일 전송*/
// EmailJS SDK 초기화
emailjs.init('AQIP54YdE-nrDKrJ2'); // 공개 키

// 폼 제출 이벤트 처리
document.getElementById('contact-form').addEventListener('submit', function (event) {
  event.preventDefault(); // 기본 폼 제출 동작 방지

  // 버튼 비활성화 및 로딩 메시지 표시
  const submitButton = event.target.querySelector('button');
  submitButton.disabled = true;
  submitButton.textContent = 'Sending...';

  // 사용자 입력값 가져오기
  const emailParams = {
    user_email: document.getElementById('user-email').value, // 이메일 값
  };

  // EmailJS API 호출
  emailjs.send('service_zxphf2z', 'template_j3jogw7', emailParams)
    .then(function (response) {
      alert('이메일이 성공적으로 전송되었습니다!');
    })
    .catch(function (error) {
      console.error('이메일 전송 실패:', error);
      alert('이메일 전송에 실패했습니다. ahwon7@naver.com으로 연락부탁드립니다.');
    })
    .finally(function () {
      // 버튼 활성화 및 텍스트 복원
      submitButton.disabled = false;
      submitButton.textContent = 'Send';
    });
});



/* 새로고침 시 맨 위로 이동 */
window.onbeforeunload = function () {
  window.scrollTo(0, 0);
};