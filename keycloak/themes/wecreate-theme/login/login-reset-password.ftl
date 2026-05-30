<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=false displayMessage=!messagesPerField.existsError('username'); section>
    <#if section = "header">
        <h1 id="kc-page-title" class="wecreate-page-title wecreate-page-title--padded">${msg("emailForgotTitle")}</h1>
    <#elseif section = "form">
        <form id="kc-reset-password-form" class="wecreate-form" action="${url.loginAction}" method="post">
            <p class="wecreate-info-text wecreate-info-text--left">
                <#if realm.duplicateEmailsAllowed>
                    ${msg("emailForgotInstructionUsername")}
                <#else>
                    ${msg("emailForgotInstruction")}
                </#if>
            </p>

            <div class="wecreate-field">
                <label for="username" class="wecreate-label">
                    <#if !realm.loginWithEmailAllowed>${msg("username")}<#elseif !realm.registrationEmailAsUsername>${msg("usernameOrEmail")}<#else>${msg("email")}</#if>
                </label>
                <input
                    type="text"
                    id="username"
                    class="wecreate-input"
                    name="username"
                    autofocus
                    autocomplete="username"
                    aria-invalid="<#if messagesPerField.existsError('username')>true</#if>"
                />
                <#if messagesPerField.existsError('username')>
                    <p class="wecreate-field-error">${kcSanitize(messagesPerField.get('username'))?no_esc}</p>
                </#if>
            </div>

            <button type="submit" class="wecreate-btn-primary">${msg("doSubmit")}</button>
            <a class="wecreate-back-link" href="${url.loginUrl}">${msg("backToLogin")}</a>
        </form>
    </#if>
</@layout.registrationLayout>
