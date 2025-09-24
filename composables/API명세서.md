# 하이브리드 앱 API 정의서

## 1. 개요

### 1.1 문서 목적
이 문서는 하이브리드 앱에서 웹뷰와 네이티브 앱 간의 통신을 위한 API 인터페이스를 정의합니다.

### 1.2 API 버전
- **현재 버전**: 1.0
- **최종 업데이트**: 2025.08.12
- **지원 플랫폼**: Web, Android, iOS

### 1.3 기본 정보
- **기본 URL**: `window.HybridApp.{functionName}`
- **호출 방식**: 동기/비동기 함수 호출
- **데이터 형식**: JSON, String, Number, Boolean

---

## 2. 시스템 관리 API

### 2.1 서버 정보 관리

#### `getServerType()`
- **설명**: 현재 서버 환경 타입을 반환합니다.
- **반환값**: `string`
  - `'s'`: Stage 환경
  - `'r'`: Production 환경  
  - `'t'`: Test 환경
- **사용 예시**:
```javascript
const serverType = window.HybridApp.getServerType();
console.log('Current server:', serverType);
```

#### `getIntentData()`
- **설명**: 앱에서 전달받은 Intent 데이터를 반환합니다.
- **반환값**: `string` (URL 인코딩된 파라미터)
- **포함 데이터**:
  - `id`: 사용자 ID
  - `mCode`: 메뉴 코드
  - `strSysUserID`: 시스템 사용자 ID
- **사용 예시**:
```javascript
const intentData = window.HybridApp.getIntentData();
// "id=123&mCode=ABC&strSysUserID=456"
```

---

## 3. 학습 진행 관리 API

### 3.1 메뉴 관리

#### `getMenuCount()`
- **설명**: 전체 메뉴 개수를 반환합니다.
- **반환값**: `number`
- **사용 예시**:
```javascript
const totalMenus = window.HybridApp.getMenuCount();
console.log('Total menus:', totalMenus);
```

#### `getMenuIndex()`
- **설명**: 현재 메뉴 인덱스를 반환합니다.
- **반환값**: `number` (0부터 시작)
- **사용 예시**:
```javascript
const currentIndex = window.HybridApp.getMenuIndex();
console.log('Current menu index:', currentIndex);
```

#### `nextMenu()`
- **설명**: 다음 메뉴로 이동합니다.
- **매개변수**: 없음
- **동작**: 
  - 현재 메뉴 인덱스 증가
  - 오디오 리스트 초기화
  - 카메라 스트림 정리
- **사용 예시**:
```javascript
window.HybridApp.nextMenu();
```

#### `setMenu(menuIdx: number)`
- **설명**: 지정된 메뉴 인덱스로 이동합니다.
- **매개변수**:
  - `menuIdx`: 이동할 메뉴 인덱스 (number)
- **사용 예시**:
```javascript
window.HybridApp.setMenu(5); // 6번째 메뉴로 이동
```

#### `resetMenu(menuIdx: number)`
- **설명**: 지정된 메뉴를 리셋하고 재시작합니다.
- **매개변수**:
  - `menuIdx`: 리셋할 메뉴 인덱스 (number)
- **동작**: 1초 후 해당 메뉴로 이동
- **사용 예시**:
```javascript
window.HybridApp.resetMenu(3);
```

### 3.2 학습 상태 관리

#### `completeContents()`
- **설명**: 현재 콘텐츠를 완료 상태로 설정합니다.
- **동작**:
  - 에듀베이스 항목 완료 여부 체크
  - 상태를 2(완료)로 설정
  - 재생 시간 기록
  - 전체 완료 시 히스토리 저장
- **사용 예시**:
```javascript
window.HybridApp.completeContents();
```

#### `getNowStatus()`
- **설명**: 현재 메뉴의 학습 진행 상태를 반환합니다.
- **반환값**: `number`
  - `0`: 미진행
  - `1`: 진행중
  - `2`: 진행완료
- **사용 예시**:
```javascript
const status = window.HybridApp.getNowStatus();
if (status === 2) {
    console.log('학습 완료!');
}
```

#### `setLastStep(step: number)`
- **설명**: 현재 메뉴의 마지막 단계를 설정합니다.
- **매개변수**:
  - `step`: 설정할 단계 번호 (number)
- **사용 예시**:
```javascript
window.HybridApp.setLastStep(5);
```

#### `getLastStep()`
- **설명**: 현재 메뉴의 마지막 단계를 반환합니다.
- **반환값**: `number` (기본값: 1)
- **사용 예시**:
```javascript
const lastStep = window.HybridApp.getLastStep();
console.log('Last step:', lastStep);
```

#### `isFirstLoadedMenu()`
- **설명**: 첫 번째 로드된 메뉴인지 확인합니다.
- **반환값**: `boolean`
- **사용 예시**:
```javascript
if (window.HybridApp.isFirstLoadedMenu()) {
    console.log('첫 번째 메뉴입니다.');
}
```

#### `isContinueStudy()`
- **설명**: 이어서 학습할 수 있는지 확인하고 사용자에게 선택을 요청합니다.
- **반환값**: `boolean`
- **동작**: 
  - 학습 완료 시 처음부터 진행 여부 확인
  - 진행중인 학습이 있으면 이어서 진행 여부 확인
- **사용 예시**:
```javascript
const canContinue = window.HybridApp.isContinueStudy();
```

---

## 4. 데이터 관리 API

### 4.1 일반 데이터 관리

#### `setData(strData: string)`
- **설명**: 일반 데이터를 저장합니다.
- **매개변수**:
  - `strData`: 저장할 데이터 (string)
- **사용 예시**:
```javascript
window.HybridApp.setData('user_input_data');
```

#### `getData()`
- **설명**: 저장된 일반 데이터를 반환합니다.
- **반환값**: `string`
- **사용 예시**:
```javascript
const data = window.HybridApp.getData();
console.log('Saved data:', data);
```

#### `setInstantData(strData: string)`
- **설명**: 즉시 사용할 데이터를 저장합니다.
- **매개변수**:
  - `strData`: 저장할 데이터 (string)
- **사용 예시**:
```javascript
window.HybridApp.setInstantData('temp_data');
```

#### `getInstantData()`
- **설명**: 저장된 즉시 데이터를 반환합니다.
- **반환값**: `string`
- **사용 예시**:
```javascript
const instantData = window.HybridApp.getInstantData();
```

### 4.2 점수 관리

#### `setCurrentMenuScore(score: number)`
- **설명**: 현재 메뉴의 점수를 설정합니다.
- **매개변수**:
  - `score`: 설정할 점수 (number)
- **사용 예시**:
```javascript
window.HybridApp.setCurrentMenuScore(85);
```

---

## 5. 카메라 및 이미지 API

### 5.1 카메라 제어

#### `startCameraPreview(camFacing, x, y, width, height)`
- **설명**: 카메라 프리뷰를 시작합니다.
- **매개변수**:
  - `camFacing`: 카메라 방향 ('front' 또는 'back')
  - `x`: X 좌표 (number)
  - `y`: Y 좌표 (number)
  - `width`: 너비 (number)
  - `height`: 높이 (number)
- **동작**: 
  - 카메라 권한 요청
  - 비디오 요소 생성 및 배치
  - 스트림 시작
- **사용 예시**:
```javascript
window.HybridApp.startCameraPreview('front', 100, 100, 320, 240);
```

#### `stopCameraPreview()`
- **설명**: 카메라 프리뷰를 중지합니다.
- **사용 예시**:
```javascript
window.HybridApp.stopCameraPreview();
```

#### `stopAndHideCameraPreview()`
- **설명**: 카메라 프리뷰를 중지하고 숨깁니다.
- **사용 예시**:
```javascript
window.HybridApp.stopAndHideCameraPreview();
```

### 5.2 이미지 캡처 및 저장

#### `saveCameraPreview(callback)`
- **설명**: 카메라 프리뷰를 이미지로 저장합니다.
- **매개변수**:
  - `callback`: 저장 완료 후 호출할 콜백 함수 또는 함수명 (string)
- **동작**: 
  - Canvas에 카메라 영상 그리기
  - PNG 형식으로 변환
  - 콜백 함수 호출
- **사용 예시**:
```javascript
window.HybridApp.saveCameraPreview('onImageSaved');
// 또는
window.HybridApp.saveCameraPreview(() => {
    console.log('이미지 저장 완료');
});
```

#### `capture(callback)`
- **설명**: 저장된 이미지를 캡처합니다.
- **매개변수**:
  - `callback`: 캡처 완료 후 호출할 콜백 함수 (function)
- **반환값**: base64 인코딩된 이미지 데이터
- **사용 예시**:
```javascript
window.HybridApp.capture((imageData) => {
    console.log('Captured image:', imageData);
});
```

#### `saveBase64ImgToPng(filename: string, base64Data: string)`
- **설명**: Base64 이미지 데이터를 PNG 파일로 저장합니다.
- **매개변수**:
  - `filename`: 저장할 파일명 (string)
  - `base64Data`: Base64 인코딩된 이미지 데이터 (string)
- **반환값**: `string` (저장된 파일명)
- **동작**: 
  - 이미지 데이터를 imageSaveGroup에 저장
  - 자동으로 서버 업로드 실행
- **사용 예시**:
```javascript
const filename = window.HybridApp.saveBase64ImgToPng('test.png', base64String);
```

#### `captureNSave(callbackName: string, path: string, quality: number)`
- **설명**: 화면을 캡처하고 저장합니다.
- **매개변수**:
  - `callbackName`: 저장 완료 후 호출할 콜백 함수명 (string)
  - `path`: 저장할 경로 (string)
  - `quality`: 이미지 품질 (0-100, number)
- **동작**: 
  - iframe 내용 캡처
  - 카메라 프리뷰가 있으면 병합
  - 지정된 품질로 PNG 저장
- **사용 예시**:
```javascript
window.HybridApp.captureNSave('onCaptureComplete', '/images/screenshot.png', 90);
```

### 5.3 이미지 업로드

#### `eventUploadImg(path: string)`
- **설명**: 이미지를 서버에 업로드합니다.
- **매개변수**:
  - `path`: 업로드할 이미지 경로 (string)
- **동작**: 
  - imageSaveGroup에서 이미지 데이터 찾기
  - FormData로 서버 전송
  - 결과를 uploadResult 콜백으로 전달
- **사용 예시**:
```javascript
window.HybridApp.eventUploadImg('/images/user_drawing.png');
```

#### `eventImgCheck()`
- **설명**: 서버에 이미지 파일 존재 여부를 확인합니다.
- **동작**: 
  - API 호출로 파일 정보 조회
  - 존재하는 경우 다운로드 경로 제공
  - eventImgCheckResult 콜백으로 결과 전달
- **사용 예시**:
```javascript
window.HybridApp.eventImgCheck();
```

---

## 6. 오디오 및 녹음 API

### 6.1 녹음 관리

#### `startRecord(id: string)`
- **설명**: 오디오 녹음을 시작합니다.
- **매개변수**:
  - `id`: 녹음 식별자 (string)
- **동작**: 
  - 마이크 권한 요청
  - Recorder 인스턴스 생성
  - 녹음 시작
- **사용 예시**:
```javascript
window.HybridApp.startRecord('user_voice_001');
```

#### `stopRecord()`
- **설명**: 오디오 녹음을 중지합니다.
- **동작**: 
  - 녹음 중지
  - 녹음 파일 생성
  - 재생 이벤트 리스너 설정
- **사용 예시**:
```javascript
window.HybridApp.stopRecord();
```

#### `afterRecording(args: any)`
- **설명**: 녹음 완료 후 처리합니다.
- **매개변수**:
  - `args`: 녹음 결과 데이터 (any)
- **동작**: createSound 함수 호출
- **사용 예시**:
```javascript
window.HybridApp.afterRecording(recordingData);
```

### 6.2 사운드 제어

#### `createSound(id: string, path: string)`
- **설명**: 오디오 요소를 생성합니다.
- **매개변수**:
  - `id`: 사운드 식별자 (string)
  - `path`: 오디오 파일 경로 (string)
- **동작**: audioList에 오디오 정보 추가
- **사용 예시**:
```javascript
window.HybridApp.createSound('bgm', 'audio/background.mp3');
```

#### `playSound(id: string, loop?: boolean, volume?: number, callback?: string)`
- **설명**: 오디오를 재생합니다.
- **매개변수**:
  - `id`: 재생할 사운드 식별자 (string)
  - `loop`: 반복 재생 여부 (boolean, 기본값: false)
  - `volume`: 볼륨 (number, 기본값: 1)
  - `callback`: 재생 완료 후 호출할 콜백 함수명 (string)
- **동작**: 
  - 오디오 요소 찾기
  - 자동재생 차단 대응
  - 재생 시작
- **사용 예시**:
```javascript
window.HybridApp.playSound('bgm', true, 0.8, 'onBGMComplete');
```

#### `pauseSound(id: string)`
- **설명**: 오디오 재생을 일시정지합니다.
- **매개변수**:
  - `id`: 일시정지할 사운드 식별자 (string)
- **사용 예시**:
```javascript
window.HybridApp.pauseSound('bgm');
```

#### `resumeSound(id: string)`
- **설명**: 일시정지된 오디오를 재개합니다.
- **매개변수**:
  - `id`: 재개할 사운드 식별자 (string)
- **사용 예시**:
```javascript
window.HybridApp.resumeSound('bgm');
```

#### `stopSound(id: string)`
- **설명**: 오디오 재생을 중지합니다.
- **매개변수**:
  - `id`: 중지할 사운드 식별자 (string)
- **사용 예시**:
```javascript
window.HybridApp.stopSound('bgm');
```

### 6.3 사운드 제어 (고급)

#### `seekSound(id: string, milliseconds: number)`
- **설명**: 오디오 재생 위치를 이동합니다.
- **매개변수**:
  - `id`: 사운드 식별자 (string)
  - `milliseconds`: 이동할 시간 (밀리초, number)
- **사용 예시**:
```javascript
window.HybridApp.seekSound('bgm', 30000); // 30초로 이동
```

#### `setVolume(id: string, volume: number)`
- **설명**: 오디오 볼륨을 설정합니다.
- **매개변수**:
  - `id`: 사운드 식별자 (string)
  - `volume`: 설정할 볼륨 (0.0 ~ 1.0, number)
- **사용 예시**:
```javascript
window.HybridApp.setVolume('bgm', 0.5);
```

#### `getSoundDuration(id: string)`
- **설명**: 오디오의 전체 길이를 반환합니다.
- **매개변수**:
  - `id`: 사운드 식별자 (string)
- **반환값**: `number` (초 단위)
- **사용 예시**:
```javascript
const duration = window.HybridApp.getSoundDuration('bgm');
console.log('Duration:', duration, 'seconds');
```

#### `getSoundCurrent(id: string)`
- **설명**: 오디오의 현재 재생 위치를 반환합니다.
- **매개변수**:
  - `id`: 사운드 식별자 (string)
- **반환값**: `number` (초 단위)
- **사용 예시**:
```javascript
const currentTime = window.HybridApp.getSoundCurrent('bgm');
console.log('Current time:', currentTime, 'seconds');
```

---

## 7. 음성인식(STT) API

### 7.1 STT 모드 관리

#### `startSilvySTTMode(model: number, uiType: number, text?: string, answer?: string)`
- **설명**: 음성인식(STT) 모드를 시작합니다.
- **매개변수**:
  - `model`: STT 모델 타입 (number)
  - `uiType`: UI 타입 (number)
  - `text`: 참조 텍스트 (string, 선택사항)
  - `answer`: 정답 텍스트 (string, 선택사항)
- **동작**: 
  - 기존 오디오 일시정지
  - 마이크 권한 요청
  - 녹음 팝업 표시
  - 음성인식 결과 처리
- **사용 예시**:
```javascript
window.HybridApp.startSilvySTTMode(1, 1, '안녕하세요', '안녕하세요');
```

#### `startSilvySTTMode2(model: number, uiType: number)`
- **설명**: STT 모드를 시작합니다 (2번째 오버로드).
- **매개변수**:
  - `model`: STT 모델 타입 (number)
  - `uiType`: UI 타입 (number)
- **사용 예시**:
```javascript
window.HybridApp.startSilvySTTMode2(1, 1);
```

#### `stopSilvy()`
- **설명**: STT 모드를 중지합니다.
- **사용 예시**:
```javascript
window.HybridApp.stopSilvy();
```

---

## 8. 동영상 및 미디어 API

### 8.1 동영상 재생

#### `playMovie(path: string, mode?: any, nextPath?: any)`
- **설명**: 동영상을 재생합니다.
- **매개변수**:
  - `path`: 동영상 파일 경로 (string)
  - `mode`: 재생 모드 (any, 선택사항)
  - `nextPath`: 다음 재생할 경로 (any, 선택사항)
- **동작**: 
  - 동영상 로드
  - 오디오 리스트 초기화
  - 비디오 소스 설정
- **사용 예시**:
```javascript
window.HybridApp.playMovie('videos/lesson.mp4', 'normal', 'videos/next.mp4');
```

#### `showPopMovie(url: string)`
- **설명**: 팝업으로 동영상을 재생합니다.
- **매개변수**:
  - `url`: 동영상 URL (string)
- **사용 예시**:
```javascript
window.HybridApp.showPopMovie('videos/popup.mp4');
```

#### `onClosePopupMovie()`
- **설명**: 팝업 동영상을 종료합니다.
- **사용 예시**:
```javascript
window.HybridApp.onClosePopupMovie();
```

---

## 9. 데이터 저장 및 API 연동

### 9.1 노드 플레이어 데이터

#### `setNodePlayerData(pageID: number, stepID: number, data: string)`
- **설명**: 노드 플레이어 데이터를 서버에 저장합니다.
- **매개변수**:
  - `pageID`: 페이지 ID (number)
  - `stepID`: 단계 ID (number)
  - `data`: 저장할 데이터 (string)
- **동작**: 
  - FormData 생성
  - API 서버로 POST 요청
  - 결과를 onResultSetNodePlayerData 콜백으로 전달
- **사용 예시**:
```javascript
window.HybridApp.setNodePlayerData(1, 2, 'user_progress_data');
```

#### `getNodePlayerData(pageID: number, stepID: number)`
- **설명**: 서버에서 노드 플레이어 데이터를 조회합니다.
- **매개변수**:
  - `pageID`: 페이지 ID (number)
  - `stepID`: 단계 ID (number)
- **동작**: 
  - API 서버로 POST 요청
  - 결과를 onResultGetNodePlayerData 콜백으로 전달
- **사용 예시**:
```javascript
window.HybridApp.getNodePlayerData(1, 2);
```

### 9.2 문자 인식

#### `convertCharacterCJ(type: string, jsonData: string)`
- **설명**: 이미지를 문자로 변환합니다.
- **매개변수**:
  - `type`: 문자 타입 ('kor' 또는 기타)
  - `jsonData`: 추가 데이터 (string)
- **동작**: 
  - imageSaveGroup의 이미지들을 FormData로 변환
  - 서버로 전송하여 문자 인식 수행
  - 결과를 onConvertResultsCharacterCJ 콜백으로 전달
- **반환값**: `Promise<{status: string, data?: any, error?: string}>`
- **사용 예시**:
```javascript
window.HybridApp.convertCharacterCJ('kor', '{"option": "value"}')
    .then(result => {
        console.log('Conversion result:', result);
    });
```

---

## 10. 유틸리티 API

### 10.1 메시지 처리

#### `message(msg: any, callback: any, callback2: any)`
- **설명**: 메시지를 표시합니다.
- **매개변수**:
  - `msg`: 표시할 메시지 (any)
  - `callback`: 콜백 함수 (any)
  - `callback2`: 두 번째 콜백 함수 (any)
- **사용 예시**:
```javascript
window.HybridApp.message('작업이 완료되었습니다.', () => {
    console.log('Message callback executed');
});
```

#### `toast(msg: any)`
- **설명**: 토스트 메시지를 표시합니다.
- **매개변수**:
  - `msg`: 표시할 메시지 (any)
- **사용 예시**:
```javascript
window.HybridApp.toast('저장되었습니다.');
```

### 10.2 이벤트 처리

#### `eventHandle(callback: string, result: any)`
- **설명**: 이벤트 콜백을 실행합니다.
- **매개변수**:
  - `callback`: 실행할 콜백 함수명 (string)
  - `result`: 콜백에 전달할 결과 데이터 (any)
- **동작**: window.HybridApp에서 해당 함수 찾아 실행
- **사용 예시**:
```javascript
window.HybridApp.eventHandle('onSuccess', 'operation_completed');
```

### 10.3 기타 유틸리티

#### `getBluetoothDeviceInfo()`
- **설명**: 블루투스 장치 정보를 반환합니다.
- **반환값**: `string` (현재는 빈 배열 반환)
- **사용 예시**:
```javascript
const btInfo = window.HybridApp.getBluetoothDeviceInfo();
```

#### `remainFace(strCode: string)`
- **설명**: 얼굴 인식 관련 기능 (구현되지 않음).
- **매개변수**:
  - `strCode`: 얼굴 코드 (string)
- **사용 예시**:
```javascript
window.HybridApp.remainFace('face_code_123');
```

#### `exit(isExit: boolean)`
- **설명**: 앱 종료 (구현되지 않음).
- **매개변수**:
  - `isExit`: 종료 여부 (boolean)
- **사용 예시**:
```javascript
window.HybridApp.exit(true);
```

---

## 11. 콜백 함수 목록

### 11.1 필수 콜백 함수
다음 콜백 함수들은 하이브리드 앱에서 구현해야 합니다:

```javascript
// 이미지 저장 완료
window.HybridApp.onImageSaved = function(filename) {
    console.log('Image saved:', filename);
};

// 업로드 결과
window.HybridApp.uploadResult = function(result) {
    console.log('Upload result:', result);
};

// 문자 변환 결과
window.HybridApp.onConvertResultsCharacterCJ = function(result) {
    console.log('Character conversion result:', result);
};

// 노드 플레이어 데이터 저장 결과
window.HybridApp.onResultSetNodePlayerData = function(result) {
    console.log('Set node player data result:', result);
};

// 노드 플레이어 데이터 조회 결과
window.HybridApp.onResultGetNodePlayerData = function(result) {
    console.log('Get node player data result:', result);
};

// STT 결과 처리
window.HybridApp.onResultSTTMode = function(result) {
    console.log('STT result:', result);
};
```

---

## 12. 에러 처리 및 예외 상황

### 12.1 일반적인 에러 상황
- **권한 거부**: 카메라, 마이크 접근 권한이 거부된 경우
- **네트워크 오류**: API 호출 시 네트워크 연결 실패
- **파일 없음**: 요청한 파일이 존재하지 않는 경우
- **메모리 부족**: 대용량 이미지 처리 시 메모리 부족

### 12.2 에러 처리 권장사항
```javascript
// 권한 확인
if (!navigator.mediaDevices) {
    console.error('미디어 장치를 지원하지 않습니다.');
    return;
}

// 네트워크 에러 처리
try {
    await window.HybridApp.convertCharacterCJ('kor', '{}');
} catch (error) {
    console.error('문자 변환 실패:', error);
}

// 파일 존재 확인
if (!fileExists) {
    console.warn('파일이 존재하지 않습니다.');
    return;
}
```

---

## 13. 성능 최적화 가이드

### 13.1 권장사항
- **이미지 크기**: 업로드 전 이미지 크기 최적화
- **오디오 품질**: 필요에 따라 적절한 오디오 품질 설정
- **메모리 관리**: 사용하지 않는 미디어 스트림 정리
- **비동기 처리**: 장시간 작업은 비동기로 처리

### 13.2 주의사항
- **동시 실행**: 여러 미디어 작업 동시 실행 시 성능 저하 가능
- **메모리 누수**: 이벤트 리스너 정리 및 스트림 해제 필수
- **네트워크 지연**: API 호출 시 네트워크 상태 고려

---

## 14. 버전 호환성

### 14.1 지원 브라우저
- **Chrome**: 60+
- **Firefox**: 55+
- **Safari**: 11+
- **Edge**: 79+

### 14.2 플랫폼 지원
- **Web**: 모든 모던 브라우저
- **Android**: WebView 기반
- **iOS**: WKWebView 기반

---

## 15. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2025.08.12 | 최초 작성, 모든 API 함수 정의 |

