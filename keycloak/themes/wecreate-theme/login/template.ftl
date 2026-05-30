<#import "footer.ftl" as loginFooter>
<#macro registrationLayout bodyClass="" displayInfo=false displayMessage=true displayRequiredFields=false>
<!DOCTYPE html>
<html class="wecreate-html"<#if locale??> lang="${locale.currentLanguageTag}" dir="${(locale.rtl)?then('rtl','ltr')}"<#else> lang="en" dir="ltr"</#if>>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${msg("loginTitle",(realm.displayName!''))}</title>
    <link rel="icon" href="${url.resourcesPath}/img/logo-collapse.png" />
    <#if properties.stylesCommon?has_content>
        <#list properties.stylesCommon?split(' ') as style>
            <link href="${url.resourcesCommonPath}/${style}" rel="stylesheet" />
        </#list>
    </#if>
    <#if properties.styles?has_content>
        <#list properties.styles?split(' ') as style>
            <link href="${url.resourcesPath}/${style}" rel="stylesheet" />
        </#list>
    </#if>
    <#if properties.scripts?has_content>
        <#list properties.scripts?split(' ') as script>
            <script src="${url.resourcesPath}/${script}" type="module"></script>
        </#list>
    </#if>
    <#if scripts??>
        <#list scripts as script>
            <script src="${script}" type="text/javascript"></script>
        </#list>
    </#if>
</head>
<body class="wecreate-body">
<div class="wecreate-page">
    <header class="wecreate-brand-badge" id="kc-header">
        <img src="${url.resourcesPath}/img/logo.png" alt="We-Create" class="wecreate-logo" />
    </header>

    <main class="wecreate-auth-card" id="kc-form-card">
        <#if displayMessage && message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
            <div class="wecreate-alert wecreate-alert-${message.type}" role="alert">
                ${kcSanitize(message.summary)?no_esc}
            </div>
        </#if>

        <#nested "header">
        <#nested "form">
        <#nested "socialProviders">
        <#if displayInfo>
            <#nested "info">
        </#if>
    </main>
</div>
<@loginFooter.content/>
</body>
</html>
</#macro>
