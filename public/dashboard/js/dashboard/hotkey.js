function go(url) { $.pjax({url: url, container: '#contents'}) }
$(document).bind('keydown', 'shift+q', () => go('/manage/1/view'))
$(document).bind('keydown', 'shift+w', () => go('/manage/2/view'))
$(document).bind('keydown', 'shift+a', () => go('/manage/1/edit'))
$(document).bind('keydown', 'shift+s', () => go('/manage/2/edit'))
$(document).bind('keydown', '/', () => $(".hotkeyhelp").modal('show'))

document.write(`
<div class="ui modal hotkeyhelp">
  <div class="header">
    Baw Service 단축키
  </div>
  <div class="content">

    <table class="ui olive table">
      <thead>
        <tr>
          <th>기능</th>
          <th>단축키</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Shift + Q</td>
          <td>후원 사이트 관리</td>
        </tr>
        <tr>
          <td>Shift + W</td>
          <td>정품 인증 사이트 관리</td>
        </tr>
        <tr>
          <td>Shift + A</td>
          <td>후원 사이트 수정</td>
        </tr>
        <tr>
          <td>Shift + S</td>
          <td>정품 인증 사이트 수정</td>
        </tr>
        <tr>
          <td>/</td>
          <td>단축키 도움말</td>
        </tr>
      </tbody>
    </table>

  </div>
  <div class="actions">
    <div class="ui positive right labeled icon button">
      확인
      <i class="far fa-check icon"></i>
    </div>
  </div>
</div>`)
