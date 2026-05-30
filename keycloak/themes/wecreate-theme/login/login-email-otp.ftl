<#import "template.ftl" as layout>
<#assign sessionExpired = false>
<#if message?has_content>
    <#assign summaryLower = message.summary?lower_case>
    <#if summaryLower?contains("expired") || summaryLower?contains("restart login") || summaryLower?contains("cookie not found") || summaryLower?contains("action expired")>
        <#assign sessionExpired = true>
    </#if>
</#if>

<@layout.registrationLayout displayMessage=false; section>
    <#if section = "header">
        <#if sessionExpired>
            <h1 id="kc-page-title" class="wecreate-page-title">${msg("sessionExpiredTitle")}</h1>
            <p class="wecreate-info-text wecreate-info-text--left wecreate-session-expired-text">${msg("sessionExpiredMessage")}</p>
        <#else>
            <h1 id="kc-page-title" class="wecreate-page-title">${msg("loginEmailOtpVerifyTitle")}</h1>
            <p class="wecreate-otp-instruction">${msg("loginEmailOtpInstruction")}</p>
        </#if>
    <#elseif section = "form">
        <#if sessionExpired>
            <div class="wecreate-session-expired-actions">
                <a class="wecreate-btn-primary wecreate-btn-link" href="${url.loginUrl}">${msg("signInAgain")}</a>
            </div>
        <#else>
            <#if messagesPerField.existsError('email-otp')>
                <div id="wecreate-otp-top-error" class="wecreate-alert wecreate-alert-error" role="alert">
                    ${kcSanitize(messagesPerField.get('email-otp'))?no_esc}
                </div>
            <#elseif message?has_content && message.type == 'error'>
                <div id="wecreate-otp-top-error" class="wecreate-alert wecreate-alert-error" role="alert">
                    ${kcSanitize(message.summary)?no_esc}
                </div>
            </#if>

            <#if message?has_content && (message.type == 'success' || message.type == 'info' || message.type == 'warning')>
                <p id="wecreate-otp-server-status" class="wecreate-otp-status wecreate-otp-status--${message.type}" role="status">
                    ${kcSanitize(message.summary)?no_esc}
                </p>
            </#if>
            <p id="wecreate-otp-status" class="wecreate-otp-status" role="status" aria-live="polite" hidden></p>

            <form
                id="kc-otp-login-form"
                class="wecreate-form wecreate-otp-form"
                action="${url.loginAction}"
                method="post"
                onsubmit="var b=document.getElementById('kc-login'); if(b) b.disabled=true; return true;"
            >
                <div class="wecreate-otp-digits" id="kc-otp-digit-inputs" role="group" aria-label="${msg("loginEmailOtp")}">
                    <#list 0..5 as i>
                        <input
                            type="text"
                            class="wecreate-otp-digit"
                            maxlength="1"
                            autocapitalize="characters"
                            autocomplete="one-time-code"
                            placeholder=" "
                            data-index="${i}"
                            aria-label="${msg("loginEmailOtpCharacter")} ${i + 1}"
                            aria-describedby="<#if messagesPerField.existsError('email-otp')>wecreate-otp-top-error</#if>"
                        />
                    </#list>
                </div>
                <input type="hidden" id="email-otp" name="email-otp" value="" />

                <#if deviceTrustEnabled?? && deviceTrustEnabled>
                    <div class="wecreate-remember wecreate-otp-trust">
                        <input type="checkbox" id="trust-device" class="wecreate-checkbox" name="trust-device" value="true" />
                        <label for="trust-device" class="wecreate-remember-label">
                            <#if deviceTrustPermanent?? && deviceTrustPermanent>
                                Do not ask for a code on this device again
                            <#elseif trustDurationUnitKey??>
                                <#assign trustDuration = trustDurationValue!1>
                                <#assign trustUnitKey = trustDurationUnitKey>
                                <#if (trustDuration?number > 1) && trustUnitKey?ends_with("One")>
                                    <#assign trustUnitKey = trustUnitKey?replace("One", "Many")>
                                </#if>
                                Do not ask for a code on this device for ${trustDuration} ${msg(trustUnitKey)}
                            <#else>
                                Do not ask for a code on this device again
                            </#if>
                        </label>
                    </div>
                </#if>

                <p class="wecreate-otp-resend">
                    <span class="wecreate-signup-muted">${msg("didNotReceiveCode")}</span>
                    <button type="submit" class="wecreate-otp-resend-btn" name="resend-email" id="kc-resend-email">
                        ${msg("doResendEmailOtp")}
                    </button>
                </p>

                <button type="submit" class="wecreate-btn-primary" name="login" id="kc-login">${msg("doVerify")}</button>
            </form>
            <script src="${url.resourcesPath}/js/wecreate-otp.js"></script>
        </#if>
    </#if>
</@layout.registrationLayout>
