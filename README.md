# Baw Service Beta 4 OpenSource Project
## 시작하기에 앞서..
이 프로젝트에는 Baw Service Beta 4의 대부분의 소스와 이미지, 콘피그가 포함되어 있습니다.

다운로드는 [여기를 클릭](https://gitlab.com/Baw-Dev/Baw-Service/-/archive/master/Baw-Service-master.zip)해서 다운로드 받을 수 있습니다.
단, 이 프로젝트는 Baw Service가 이용하는 SMS 및 알림톡 부가 서비스를 그대로 이용하기 위해서 dotname korea SMS 호스팅을 구매해야 하며, BizM의 알림톡 서비스의 템플릿 검수도 필요합니다.
또한 이 소스는 최적화 그딴거 하나도 없으며, 제대로 작동하는지도 모르며, 설치 가이드도 없으며, SQL 구조도 없고, 설치 페이지, 명령어 그딴거도 없습니다.
심지어 Sentry의 오류 보고 시스템도 사용하고 있어 해당 서비스의 연동도 필요합니다.
즉, 이 소스는 참고용이지, Fork를 통해서 따로 개발하지 않는 이상 개발하는 것은 사실상 불가능에 가깝습니다.

# 서버 기본 설정

Baw Service Beta 4는 OpenSource Project를 목표로 개발되어 있기 때문에 config를 사용합니다.
대부분의 콘피그 파일은 기본적으로 설치되어 있지 않지만 [/config/gitlab_distribution] 이라는 이름의 폴더로 기본 콘피그 파일을 정리해두었습니다. 이 파일을 [/config]로 모두 이동시키고 파일 내용을 수정하여 자신에 맞게 설정하세요.

## 그럼 이걸 왜 배포하는건가요?
Baw Service는 돈이 오고 가는 플렛폼으로써 마인크래프트 서버 운영자분들이 믿고 사용할 수 있도록 소스를 공개하고 있습니다.

## 속도 암걸리네요
만약 이 프로젝트를 그냥 실행한다면 Baw Service의 속도는 평균 800ms입니다. Express의 캐싱 기능을 활성화하면 13ms 정도의 아주 빠른 속도로 사용이 가능합니다.
Express의 캐싱을 활성화 하기 위해서 다음 명령어를 실행해야 합니다.

### Windows
Command Prompt로 앱을 실행하는 경우 아래 명령어를 앱 실행 전 입력하세요.
	set NODE_ENV=production

### Linux
Upstart를 이용하는 경우, 작업 파일에 env 키워드를 사용하십시오. 예를 들면 다음과 같습니다.

	/etc/init/env.conf
	env NODE_ENV=production


systemd를 이용하는 경우, 유닛 파일에 Environment 지시문을 사용하십시오. 예를 들면 다음과 같습니다.

	/etc/systemd/system/myservice.service
	Environment=NODE_ENV=production
