<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=false displayInfo=false; section>
    <#if section = "header">
        <h1 id="kc-page-title" class="wecreate-page-title">${msg("sessionExpiredTitle")}</h1>
        <p class="wecreate-info-text wecreate-info-text--left wecreate-session-expired-text">${msg("sessionExpiredMessage")}</p>
    <#elseif section = "form">
        <div class="wecreate-session-expired-actions">
            <a class="wecreate-btn-primary wecreate-btn-link" href="${(url.loginRestartFlowUrl)!url.loginUrl}">${msg("signInAgain")}</a>
        </div>
    </#if>
</@layout.registrationLayout>
