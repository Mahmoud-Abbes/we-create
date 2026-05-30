<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('firstName','lastName','username','email','password','password-confirm') displayInfo=true; section>
    <#if section = "header">
        <h1 id="kc-page-title" class="wecreate-page-title">${msg("registerTitle")}</h1>
    <#elseif section = "form">
        <form id="kc-register-form" class="wecreate-form wecreate-register-form" action="${url.registrationAction}" method="post">
            <div class="wecreate-row-two">
                <div class="wecreate-field">
                    <label for="firstName" class="wecreate-label">${msg("firstName")}</label>
                    <input
                        type="text"
                        id="firstName"
                        class="wecreate-input"
                        name="firstName"
                        value="${(register.formData.firstName!'')}"
                        autocomplete="given-name"
                        aria-invalid="<#if messagesPerField.existsError('firstName')>true</#if>"
                    />
                    <#if messagesPerField.existsError('firstName')>
                        <p class="wecreate-field-error">${kcSanitize(messagesPerField.get('firstName'))?no_esc}</p>
                    </#if>
                </div>
                <div class="wecreate-field">
                    <label for="lastName" class="wecreate-label">${msg("lastName")}</label>
                    <input
                        type="text"
                        id="lastName"
                        class="wecreate-input"
                        name="lastName"
                        value="${(register.formData.lastName!'')}"
                        autocomplete="family-name"
                        aria-invalid="<#if messagesPerField.existsError('lastName')>true</#if>"
                    />
                    <#if messagesPerField.existsError('lastName')>
                        <p class="wecreate-field-error">${kcSanitize(messagesPerField.get('lastName'))?no_esc}</p>
                    </#if>
                </div>
            </div>

            <#if !realm.registrationEmailAsUsername>
                <div class="wecreate-field">
                    <label for="username" class="wecreate-label">${msg("username")}</label>
                    <input
                        type="text"
                        id="username"
                        class="wecreate-input"
                        name="username"
                        value="${(register.formData.username!'')}"
                        autocomplete="username"
                        aria-invalid="<#if messagesPerField.existsError('username')>true</#if>"
                    />
                    <#if messagesPerField.existsError('username')>
                        <p class="wecreate-field-error">${kcSanitize(messagesPerField.get('username'))?no_esc}</p>
                    </#if>
                </div>
            </#if>

            <div class="wecreate-field">
                <label for="email" class="wecreate-label">${msg("email")}</label>
                <input
                    type="text"
                    id="email"
                    class="wecreate-input"
                    name="email"
                    value="${(register.formData.email!'')}"
                    autocomplete="email"
                    aria-invalid="<#if messagesPerField.existsError('email')>true</#if>"
                />
                <#if messagesPerField.existsError('email')>
                    <p class="wecreate-field-error">${kcSanitize(messagesPerField.get('email'))?no_esc}</p>
                </#if>
            </div>

            <#if passwordRequired??>
                <div class="wecreate-field">
                    <label for="password" class="wecreate-label">${msg("password")}</label>
                    <input
                        type="password"
                        id="password"
                        class="wecreate-input"
                        name="password"
                        autocomplete="new-password"
                        aria-invalid="<#if messagesPerField.existsError('password','password-confirm')>true</#if>"
                    />
                    <#if messagesPerField.existsError('password')>
                        <p class="wecreate-field-error">${kcSanitize(messagesPerField.get('password'))?no_esc}</p>
                    </#if>
                </div>
                <div class="wecreate-field">
                    <label for="password-confirm" class="wecreate-label">${msg("passwordConfirm")}</label>
                    <input
                        type="password"
                        id="password-confirm"
                        class="wecreate-input"
                        name="password-confirm"
                        autocomplete="new-password"
                        aria-invalid="<#if messagesPerField.existsError('password-confirm')>true</#if>"
                    />
                    <#if messagesPerField.existsError('password-confirm')>
                        <p class="wecreate-field-error">${kcSanitize(messagesPerField.get('password-confirm'))?no_esc}</p>
                    </#if>
                </div>
            </#if>

            <#if recaptchaRequired??>
                <div class="wecreate-field wecreate-recaptcha">
                    <div class="g-recaptcha" data-size="compact" data-sitekey="${recaptchaSiteKey}"></div>
                </div>
            </#if>

            <button class="wecreate-btn-primary" type="submit">${msg("doRegister")}</button>
        </form>
    <#elseif section = "info">
        <p class="wecreate-signup-footer">
            <span class="wecreate-signup-muted">${msg("alreadyHaveAccount")}</span>
            <a href="${url.loginUrl}">${msg("doLogIn")}</a>
        </p>
    <#elseif section = "socialProviders">
        <#if social?? && social.providers?has_content>
            <div id="kc-social-providers" class="wecreate-social">
                <#list social.providers as p>
                    <a id="social-${p.alias}" class="wecreate-google-btn" href="${p.loginUrl}">
                        <img class="wecreate-google-icon" src="${url.resourcesPath}/img/google-g.svg" alt="" width="23" height="23" />
                        <span><#if p.alias == "google">${msg("signUpWithGoogle")}<#else>${p.displayName!}</#if></span>
                    </a>
                </#list>
            </div>
        </#if>
    </#if>
</@layout.registrationLayout>
