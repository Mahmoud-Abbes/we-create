<#import "template.ftl" as layout>

<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password') displayInfo=realm.password && realm.registrationAllowed && !registrationDisabled??; section>

    <#if section = "header">

        <h1 id="kc-page-title" class="wecreate-page-title">${msg("doLogIn")}</h1>

    <#elseif section = "form">

        <div id="kc-form">

            <div id="kc-form-wrapper">

                <form id="kc-form-login" class="wecreate-form" action="${url.loginAction}" method="post" data-restart-url="${url.loginRestartFlowUrl}">

                    <#if auth?has_content && auth.showUsername() && usernameHidden??>

                        <div class="wecreate-username-banner">

                            <span class="wecreate-username-banner-label">${msg("loggedInAs")}</span>

                            <span class="wecreate-username-banner-value">${auth.attemptedUsername}</span>

                            <a href="${url.loginRestartFlowUrl}" class="wecreate-username-banner-restart">${msg("restartLogin")}</a>

                        </div>

                    </#if>



                    <div class="wecreate-field" id="kc-username-field">

                        <label for="username" class="wecreate-label">

                            <#if !realm.loginWithEmailAllowed>${msg("username")}<#elseif !realm.registrationEmailAsUsername>${msg("usernameOrEmail")}<#else>${msg("email")}</#if>

                        </label>

                        <input

                            tabindex="1"

                            id="username"

                            class="wecreate-input"

                            name="username"

                            value="${(login.username!'')}"

                            type="text"

                            autofocus

                            autocomplete="username"

                            aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>"

                        />

                    </div>



                    <div class="wecreate-field">

                        <label for="password" class="wecreate-label">${msg("password")}</label>

                        <input

                            tabindex="2"

                            id="password"

                            class="wecreate-input"

                            name="password"

                            type="password"

                            autocomplete="current-password"

                            aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>"

                        />

                    </div>



                    <#if messagesPerField.existsError('username','password')>

                        <p class="wecreate-field-error" aria-live="polite">

                            ${kcSanitize(messagesPerField.getFirstError('username','password'))?no_esc}

                        </p>

                    </#if>



                    <#if realm.rememberMe>

                        <div class="wecreate-remember">

                            <#if login.rememberMe??>

                                <input tabindex="3" id="rememberMe" class="wecreate-checkbox" name="rememberMe" type="checkbox" value="on" checked="checked" />

                            <#else>

                                <input tabindex="3" id="rememberMe" class="wecreate-checkbox" name="rememberMe" type="checkbox" value="on" />

                            </#if>

                            <label for="rememberMe" class="wecreate-remember-label">${msg("rememberMe")}</label>

                        </div>

                    </#if>



                    <#if realm.resetPasswordAllowed>

                        <a tabindex="5" class="wecreate-forgot" href="${url.loginResetCredentialsUrl}">${msg("doForgotPassword")}</a>

                    </#if>



                    <input type="hidden" id="id-hidden-input" name="credentialId" <#if auth?has_content && auth.selectedCredential?has_content>value="${auth.selectedCredential}"</#if>/>

                    <button tabindex="4" class="wecreate-btn-primary" name="login" id="kc-login" type="submit">

                        ${msg("doLogIn")}

                    </button>

                </form>

            </div>

        </div>

        <script src="${url.resourcesPath}/js/wecreate-login.js"></script>

    <#elseif section = "info">

        <p class="wecreate-signup-footer">

            <span class="wecreate-signup-muted">${msg("noAccount")}</span>

            <a tabindex="6" href="${url.registrationUrl}">${msg("doRegister")}</a>

        </p>

    <#elseif section = "socialProviders">

        <#if realm.password && social?? && social.providers?has_content>

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

