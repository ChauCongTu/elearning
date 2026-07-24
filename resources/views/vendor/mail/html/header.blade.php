@props(['url'])
<tr>
<td class="header">
<a href="{{ $url }}" style="display: inline-block;">
<img src="{{ \App\Support\MailBranding::logoUrl() }}" class="logo" alt="{{ \App\Support\MailBranding::siteName() }}">
</a>
</td>
</tr>
