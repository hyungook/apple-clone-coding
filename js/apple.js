// 즉시 실행 함수  =  (function() {});
// 전역변수 사용을 피하기 위해
(() => {
  let yOffset = 0; // window.pageYOffset 대신 사용할 변수 / 편의상 변수를 만들어서 적용
  let pervScrollHeight = 0; //현재 스크롤 위치(yOffset)보다 이전에 위치한 스크롤 섹션들의 스크롤 높이값의 합
  let currentScene = 0; //현재 활성화된 (눈 앞에 보고있는) 씬(scroll-section)
  let enterNewScene = false; // 새로운 scene이 시작된 순간 true

  const sceneInfo = [
    {
      // 0
      type: "sticky",
      heightNum: 5, // 브라우저 높이의 5배로 scrollHeight 세팅하겠다는 의미.
      scrollHeight: 0, // 여기서 고정값으로 세팅할 수 있지만, 각 디바이스(화면) 사이즈 변경에도 대응해야해서 따로 함수 처리 사용
      objs: {
        container: document.querySelector("#scroll-section-0"),
        messaageA: document.querySelector("#scroll-section-0 .main-message.a"),
        messaageB: document.querySelector("#scroll-section-0 .main-message.b"),
        messaageC: document.querySelector("#scroll-section-0 .main-message.c"),
        messaageD: document.querySelector("#scroll-section-0 .main-message.d"),
      },
      values: {
        messaageA_opacity_in: [0, 1, { start: 0.1, end: 0.2 }],
        messaageA_opacity_out: [1, 0, { start: 0.25, end: 0.3 }],
        messaageB_opacity_in: [0, 1, { start: 0.3, end: 0.4 }],
        messaageB_opacity_out: [1, 0, { start: 0.25, end: 0.3 }],
      },
    },
    {
      // 1
      type: "normal",
      heightNum: 5,
      scrollHeight: 0,
      objs: {
        container: document.querySelector("#scroll-section-1"),
      },
    },
    {
      // 2
      type: "sticky",
      heightNum: 5,
      scrollHeight: 0,
      objs: {
        container: document.querySelector("#scroll-section-2"),
      },
    },
    {
      // 3
      type: "sticky",
      heightNum: 5,
      scrollHeight: 0,
      objs: {
        container: document.querySelector("#scroll-section-3"),
      },
    },
  ];

  function setLayout() {
    // 각 스트롤 섹션의 높이 세팅
    for (let i = 0; i < sceneInfo.length; i++) {
      sceneInfo[i].scrollHeight = sceneInfo[i].heightNum * window.innerHeight;
      sceneInfo[
        i
      ].objs.container.style.height = `${sceneInfo[i].scrollHeight}px`;
    }
    // console.log(sceneInfo);

    yOffset = window.pageYOffset;
    let totalScrollHeight = 0;
    for (let i = 0; i < sceneInfo.length; i++) {
      totalScrollHeight += sceneInfo[i].scrollHeight;
      if (totalScrollHeight >= yOffset) {
        currentScene = i;
        break;
      }
    }
    document.body.setAttribute("id", `show-scene-${currentScene}`);
  }

  function calcValues(values, currentYOffset) {
    let rv;
    // 현재 씬(스크롤섹션)에서 스크롤된 범위를 비율로 구하기
    const scrollHeight = sceneInfo[currentScene].scrollHeight;
    //  const scrollRatio = currentYOffset / sceneInfo[currentScene].scrollHeight; //const = 상수 / 값이 변하지 않음. => 아래와 같음
    const scrollRatio = currentYOffset / scrollHeight;

    if (values.length === 3) {
      // start ~ end 사이에 애니메이션 실행
      const partScrollStart = values[2].start * scrollHeight;
      const partScrollEnd = values[2].end * scrollHeight;
      const partScrollHeight = partScrollEnd - partScrollStart;

      if (
        currentYOffset >= partScrollStart &&
        currentYOffset <= partScrollEnd
      ) {
        rv =
          ((currentYOffset - partScrollStart) / partScrollHeight) *
            (values[1] - values[0]) +
          values[0];
      } else if (currentYOffset < partScrollStart) {
        rv = values[0];
      } else if (currentYOffset > partScrollEnd) {
        rv = values[1];
      }
    } else {
      rv = scrollRatio * (values[1] - values[0]) + values[0];
    }

    return rv;
  }

  function playAnimation() {
    const objs = sceneInfo[currentScene].objs;
    const values = sceneInfo[currentScene].values;
    const currentYOffset = yOffset - pervScrollHeight;
    // const scrollRatio = yOffset / 현재씬의 scrollHeight;
    const scrollHeight = sceneInfo[currentScene].scrollHeight;
    const scrollRatio = (yOffset - pervScrollHeight) / scrollHeight;

    // console.log(currentScene);  // 섹션 확인

    switch (currentScene) {
      case 0:
        // console.log("o play");
        const messaageA_opacity_in = calcValues(
          values.messaageA_opacity_in,
          currentYOffset
        );
        const messaageA_opacity_out = calcValues(
          values.messaageA_opacity_out,
          currentYOffset
        );

        if (scrollRatio <= 0.22) {
          // in
          objs.messaageA.style.opacity = messaageA_opacity_in;
        } else {
          // out
          objs.messaageA.style.opacity = messaageA_opacity_out;
        }

        console.log(messaageA_opacity_in);

        break;
      case 1:
        // console.log("1 play");
        break;
      case 2:
        // console.log("2 play");
        break;
      case 3:
        // console.log("3 play");
        break;
    }
  }

  function scrollLoop() {
    enterNewScene = false;
    pervScrollHeight = 0; // 초기화 작업
    for (let i = 0; i < currentScene; i++) {
      //   pervScrollHeight = pervScrollHeight + sceneInfo[i].scrollHeight;
      pervScrollHeight += sceneInfo[i].scrollHeight;
    }
    if (yOffset > pervScrollHeight + sceneInfo[currentScene].scrollHeight) {
      enterNewScene = true;
      currentScene++;
      document.body.setAttribute("id", `show-scene-${currentScene}`);
    }
    if (yOffset < pervScrollHeight) {
      enterNewScene = true;
      if (currentScene === 0) return; // 브라우저 바운스 효과로 인해 마이너스가 되는 것을 방지(모바일)
      currentScene--;
      document.body.setAttribute("id", `show-scene-${currentScene}`);
    }

    if (enterNewScene) return; //  이해안됨

    playAnimation();
  }

  window.addEventListener("scroll", () => {
    yOffset = window.pageYOffset; //현재 스크롤한 위치를 알 수 있다.

    scrollLoop();
  });

  // window.addEventListener("DOMcontentLoaded", setLayout); // =>  HTML /DOM구조만 로딩되면 실행
  window.addEventListener("load", setLayout); // =>   웹 페이지에 있는 이미지/모든 리소스까지 모두 로드된 후에 실행
  window.addEventListener("resize", setLayout);
})();
