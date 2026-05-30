<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=false; section>
    <#if section = "header">
        <h1 id="kc-page-title" class="wecreate-page-title wecreate-page-title--padded">${msg("updatePasswordTitle")}</h1>
    <#elseif section = "form">
        <form id="kc-passwd-update-form" class="wecreate-form" action="${url.loginAction}" method="post">
            <div class="wecreate-field">
                <label for="password-new" class="wecreate-label">${msg("passwordNew")}</label>
                <div class="wecreate-password-wrap">
                    <input
                        type="password"
                        id="password-new"
                        class="wecreate-input wecreate-input-password"
                        name="password-new"
                        autofocus
                        autocomplete="new-password"
                        aria-invalid="<#if messagesPerField.existsError('password')>true</#if>"
                    />
                    <button
                        type="button"
                        class="wecreate-password-toggle"
                        aria-label="${msg('showPassword')}"
                        aria-pressed="false"
                        data-target="password-new"
                        data-hide-label="${msg('hidePassword')}"
                    >
                        <svg class="wecreate-eye-icon" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                            <path fill="currentColor" d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>
                        </svg>
                    </button>
                </div>
                <#if messagesPerField.existsError('password')>
                    <p class="wecreate-field-error">${kcSanitize(messagesPerField.get('password'))?no_esc}</p>
                </#if>
            </div>

            <div class="wecreate-field">
                <label for="password-confirm" class="wecreate-label">${msg("passwordConfirm")}</label>
                <input
                    type="password"
                    id="password-confirm"
                    class="wecreate-input wecreate-input-password-plain"
                    name="password-confirm"
                    autocomplete="new-password"
                    aria-invalid="<#if messagesPerField.existsError('password-confirm')>true</#if>"
                />
                <#if messagesPerField.existsError('password-confirm')>
                    <p class="wecreate-field-error">${kcSanitize(messagesPerField.get('password-confirm'))?no_esc}</p>
                </#if>
            </div>

            <#if logoutOtherSessions?? && logoutOtherSessions>
                <div class="wecreate-remember">
                    <input type="checkbox" class="wecreate-checkbox" id="logout-sessions" name="logout-sessions" value="on" checked />
                    <label for="logout-sessions" class="wecreate-remember-label">${msg("logoutOtherSessions")}</label>
                </div>
            </#if>

            <#if isAppInitiatedAction??>
                <button type="submit" class="wecreate-btn-primary" name="login" id="kc-login">${msg("doSubmit")}</button>
                <button type="submit" class="wecreate-btn-secondary" name="cancel-aia" value="true">${msg("doCancel")}</button>
            <#else>
                <button type="submit" class="wecreate-btn-primary" name="login" id="kc-login">${msg("doSubmit")}</button>
            </#if>
        </form>
        <script src="${url.resourcesPath}/js/wecreate-password.js"></script>
    </#if>
</@layout.registrationLayout>
