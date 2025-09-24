// your_project_scripts.js

// === 자동 재생 처리 유틸리티 함수 ===
/**
 * 사용자 상호작용이 필요한 미디어(오디오/비디오) 재생을 처리합니다.
 * 이 함수는 HTML 문서 내에서 직접 사용될 때 'document' 객체에 접근합니다.
 * @param {HTMLMediaElement} mediaElement - 재생을 시도할 HTMLMediaElement (예: audio 또는 video 태그 인스턴스)
 * @param {string} buttonId - 생성할 재생 버튼의 ID (예: 'dyBgmPlayBtn', 'dyAudioPlayBtn')
 * @param {string} buttonText - 재생 버튼에 표시할 텍스트 (예: '🎶 BGM 재생하기', '▶️ 오디오 재생하기')
 * @param {string} buttonBgColor - 재생 버튼의 배경색 (CSS color value)
 * @returns {Promise<void>} - 재생 성공 또는 사용자 상호작용 후 재생 성공 시 resolve, 그 외 에러 시 reject
 */
function handleAutoplay(mediaElement) {
    return new Promise((resolve, reject) => {

        let buttonId = "dyBgmPlayBtn"
			
        let buttonText = "🎶 자동재생이 차단되었습니다. 페이지를 새로고침 합니다."
        let buttonBgColor = '#8e44ad'

        // 기존 버튼이 있으면 제거
        let playBtn = document.getElementById(buttonId);
        if (playBtn) {
            playBtn.remove();
        }

        mediaElement.play()
            .then(() => {
                // 재생 성공 시, 혹시 남아있을 수 있는 버튼 제거
                if (playBtn) {
                    playBtn.remove();
                }
                console.log(`${buttonText.replace('🎶 ', '').replace('▶️ ', '')} 재생 성공`);
                resolve(); // Promise resolve
            })
            .catch(error => {
                if (error.name === 'NotAllowedError') {
                    console.warn(`${buttonText.replace('🎶 ', '').replace('▶️ ', '')} 자동 재생이 차단되었습니다. 사용자 상호작용 필요.`);

                    // 사용자에게 재생을 요청하는 버튼 생성
                    playBtn = document.createElement('button');
                    playBtn.id = buttonId;
                    playBtn.textContent = buttonText;
                    playBtn.style.cssText = `
                        position:fixed;
                        top:50%;
                        left:50%;
                        transform:translate(-50%,-50%);
                        padding:20px 40px;
                        font-size:24px;
                        font-weight:bold;
                        cursor:pointer;
                        background-color:${buttonBgColor};
                        color:white;
                        border:none;
                        border-radius:8px;
                        box-shadow:0 4px 8px rgba(0,0,0,0.2);
                        z-index:10001;
                    `;
                    document.body.appendChild(playBtn);

                    const clickHandler = () => {
                        // 버튼 클릭 시 미디어 재생 재시도
                        mediaElement.muted = false; // 혹시라도 음소거 상태면 해제
                        mediaElement.play()
                            .then(() => {
                                console.log(`${buttonText.replace('🎶 ', '').replace('▶️ ', '')} 사용자 상호작용으로 재생 성공`);
                                if (playBtn) playBtn.remove();
                                resolve(); // Promise resolve
                            })
                            .catch(err => {
                                alert(`${buttonText.replace('🎶 ', '').replace('▶️ ', '')}을(를) 재생할 수 없습니다. 파일을 확인하거나 브라우저 설정을 확인해주세요.`);
                                console.error(`${buttonText.replace('🎶 ', '').replace('▶️ ', '')} 재생 실패 (사용자 상호작용 후):`, err);
                                if (playBtn) playBtn.remove();
                                reject(err); // Promise reject
                            });
                        playBtn.removeEventListener('click', clickHandler);
                    };

                    // 중복 이벤트 리스너 방지 및 추가
                    playBtn.removeEventListener('click', clickHandler);
                    playBtn.addEventListener('click', clickHandler);

                } else {
                    // NotAllowedError 외의 다른 에러는 콘솔에 기록하고 reject
                    console.error(`${buttonText.replace('🎶 ', '').replace('▶️ ', '')} 재생 중 알 수 없는 에러 발생:`, error);
                    reject(error); // Promise reject
                }
            });
    });
}


// === SystemMgr 클래스 정의 ===
function SystemMgr() {
    // 오디오/BGM HTML 요소가 페이지에 있어야 합니다.
    // 예: <audio id="bgmPlayer" loop></audio>
    // 예: <audio id="audioPlayer"></audio>
    this.bgm = document.getElementById('bgmPlayer');
    this.audio = document.getElementById('audioPlayer');

    // 초기 음소거 설정 (브라우저 자동 재생 정책을 위해 처음엔 음소거 상태로 시작하는 경우가 많음)
    if (this.bgm) this.bgm.muted = true;
    if (this.audio) this.audio.muted = true;
}