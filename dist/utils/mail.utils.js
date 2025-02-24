"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.send_reset_email = send_reset_email;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    host: "sg1-ts102.a2hosting.com",
    port: 465,
    secure: true,
    //   from: process.env.SMTP_EMAIL,
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
        // type: "login",
    },
    //   connectionTimeout: 10000,
});
function mail_wrapper(content) {
    return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
    <html data-editor-version="2" class="sg-campaigns" xmlns="http://www.w3.org/1999/xhtml">
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1" /><!--[if !mso]><!-->
            <meta http-equiv="X-UA-Compatible" content="IE=Edge" /><!--<![endif]-->
    
            <style type="text/css">
                body, p, div {
                    font-family: arial;
                    font-size: inherit !important;
                }
                body {
                    color: inherit !important;
                }
                body a {
                    color: #1A82E2;
                    text-decoration: none;
                }
                p { margin: 0; padding: 0; }
                table.wrapper {
                    width:100% !important;
                    table-layout: fixed;
                    -webkit-font-smoothing: antialiased;
                    -webkit-text-size-adjust: 100%;
                    -moz-text-size-adjust: 100%;
                    -ms-text-size-adjust: 100%;
                }
                img.max-width {
                    max-width: 100% !important;
                }
                .column.of-2 {
                    width: 50%;
                }
                .column.of-3 {
                    width: 33.333%;
                }
                .column.of-4 {
                    width: 25%;
                }
                @media screen and (max-width:480px) {
                    .preheader .rightColumnContent,
                    .footer .rightColumnContent {
                        text-align: left !important;
                    }
                    .preheader .rightColumnContent div,
                    .preheader .rightColumnContent span,
                    .footer .rightColumnContent div,
                    .footer .rightColumnContent span {
                        text-align: left !important;
                    }
                    .preheader .rightColumnContent,
                    .preheader .leftColumnContent {
                        font-size: 80% !important;
                        padding: 5px 0;
                    }
                    table.wrapper-mobile {
                        width: 100% !important;
                        table-layout: fixed;
                    }
                    img.max-width {
                        height: auto !important;
                        max-width: 480px !important;
                    }
                    a.bulletproof-button {
                        display: block !important;
                        width: auto !important;
                        font-size: 80%;
                        padding-left: 0 !important;
                        padding-right: 0 !important;
                    }
                    .columns {
                        width: 100% !important;
                    }
                    .column {
                        display: block !important;
                        width: 100% !important;
                        padding-left: 0 !important;
                        padding-right: 0 !important;
                    }
                }
            </style>
        </head>
        <body>
            <center class="wrapper" data-link-color="#1A82E2" data-body-style="font-size: inherit !important; font-family: arial; color: inherit !important; background-color: #e9ecef;">
                <div class="webkit">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" class="wrapper" bgcolor="#e9ecef">
                        <tr>
                            <td valign="top" bgcolor="#e9ecef" width="100%">
                                <table width="100%" role="content-container" class="outer" align="center" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                        <td width="100%">
                                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                                <tr>
                                                    <td>
                                                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width:600px;" align="center">
                                                            <tr>
                                                                <td role="modules-container" style="padding: 0px 0px 0px 0px; color: inherit !important; text-align: left;" bgcolor="#ffffff" width="100%" align="left">
                                                                ${mail_header()}
                                                                ${content}
                                                                ${mail_footer()}
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </div>
            </center>
        </body>
    </html>`;
}
// mail header
function mail_header() {
    return `
    <table class="module preheader preheader-hide" role="module" data-type="preheader" border="0" cellpadding="0" cellspacing="0" width="100%"
        style="display: none !important; mso-hide: all; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0;">
        <tr>
            <td role="module-content">
                <p></p>
            </td>
        </tr>
    </table>
    <table class="wrapper" role="module" data-type="image" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
        <tr>
            <td style="font-size:6px;line-height:10px;padding:40px 0px 40px 0px;background-color:#e9ecef;" valign="top" align="center">
                <img class="max-width" border="0" style="display:block;color:#000000;text-decoration:none;font-family:Helvetica, arial, sans-serif;font-size:16px;max-width:10% !important;width:10%;height:auto !important;" src="" alt="" width="60">
            </td>
        </tr>
    </table>
    <table class="module" role="module" data-type="divider" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
        <tr>
            <td style="padding:0px 0px 0px 0px;background-color:#d4dadf;" role="module-content" height="100%" valign="top" bgcolor="#d4dadf">
                <table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" height="3px" style="line-height:3px; font-size:3px;">
                    <tr>
                        <td style="padding: 0px 0px 3px 0px;" bgcolor="#d4dadf"></td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>`;
}
// html mail footer
function mail_footer() {
    return `
    <!-- footer top border -->
    <table class="module" role="module" data-type="divider" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
        <tr>
            <td style="padding:0px 0px 0px 0px;background-color:#d4dadf;" role="module-content" height="100%" valign="top" bgcolor="#d4dadf">
                <table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" height="3px" style="line-height:3px; font-size:3px;">
                    <tr>
                        <td style="padding: 0px 0px 3px 0px;" bgcolor="#d4dadf"></td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
        <tr>
            <td style="padding:0px 0px 0px 0px;line-height:20px;text-align:inherit;" height="100%" valign="top" bgcolor="">
                <div>
                    <table border="0" cellpadding="0" cellspacing="0" style="width:100%; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 300; font-family: arial; font-size: 14px; color: rgb(0, 0, 0);">
                    	<tbody style="font-size: 14px;">
		                    <tr style="font-size: 14px;">
		                    	<td align="center" bgcolor="#e9ecef" style="padding: 12px 24px; line-height: 20px; font-family: &quot;Source Sans Pro&quot;, Helvetica, Arial, sans-serif; font-size: 14px; color: rgb(102, 102, 102);">
		                    	    <p style="margin-bottom: 0px;">
                                        <span style="font-size:14px;">
                                            <span style="font-family:arial,helvetica,sans-serif;">
                                                <span style="color:#666;">To stop receiving these emails, you can&nbsp;</span>
                                                <a href="[unsubscribe]" style="">
                                                    <span style="">unsubscribe</span>
                                                </a>
                                                <span style="color:#666;">&nbsp;at any time.</span>
                                            </span>
                                        </span>
                                    </p>
    
			                        <p style="margin-bottom: 0px;">
                                        <span style="color:#666;">
                                            <span style="font-size:14px;">
                                                <span style="font-family:arial,helvetica,sans-serif;">
                                                    1000FiX Service Ltd.
                                                </span>
                                            </span>
                                        </span>
                                    </p>
			                    </td>
                       		</tr>
                       	</tbody>
                    </table>
                </div>
            </td>
        </tr>
    </table>`;
}
// reset link email content
function reset_link_content(link, username) {
    return `
    <table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
        <tr>
            <td style="padding:0px 0px 0px 0px;line-height:24px;text-align:inherit;" height="100%" valign="top" bgcolor="">
                <div>
                    <table border="0" cellpadding="0" cellspacing="0" style="background-color: rgb(255, 255, 255); font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 300; font-family: arial; font-size: 14px; color: rgb(0, 0, 0);" width="100%">
                    	<tbody style="font-size: 14px;">
                    		<tr style="font-size: 14px;">
                    			<td align="center" bgcolor="#e9ecef" style="font-size: 14px;">
                    			    <table border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; font-size: 14px;" width="100%">
                    			    	<tbody style="font-size: 14px;">
                    			    		<tr style="font-size: 14px;">
                    			    			<td align="left" bgcolor="#ffffff" style="padding-top: 10px; padding-right: 24px; padding-left: 24px; font-family: &quot;Source Sans Pro&quot;, Helvetica, Arial, sans-serif; font-size: 14px;">
                    			    			    <h1 style="font-size: 32px; margin-bottom: 0px; line-height: 48px; letter-spacing: -1px; font-weight: 700">
                                                        <span style="font-size:28px;">
                                                            <span style="font-family:arial black,helvetica,sans-serif;">
                                                                <strong>Reset Your Password</strong>
                                                            </span>
                                                        </span>
                                                    </h1>
                    			    			</td>
                    			    		</tr>
                    			    	</tbody>
                    			    </table>
                    			</td>
                    		</tr>
                    		<tr style="font-size: 14px;">
                    			<td align="center" bgcolor="#e9ecef" style="font-size: 14px;">
                    			    <table border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; font-size: 14px;" width="100%">
                    			    	<tbody style="font-size: 14px;">
                    			    		<tr style="font-size: 14px;">
                    			    			<td align="left" bgcolor="#ffffff" style="padding: 24px; line-height: 24px; font-family: &quot;Source Sans Pro&quot;, Helvetica, Arial, sans-serif; font-size: 16px;">
                    			    			    <p style="margin-bottom: 0px;">
                                                        <span style="font-family:arial,helvetica,sans-serif;">
                                                            <span style="font-size:16px;">
                                                                Hi <strong>${username},</strong> <br />
                                                                Tap the button below to reset your customer account password. You can safely delete this email if you didn't request a new password.
                                                            </span>
                                                        </span>
                                                    </p>
                    			    			</td>
                    			    		</tr>
                    			    	</tbody>
                    			    </table>
                    			</td>
                    		</tr>
                    	</tbody>
                    </table>
                </div>
            </td>
        </tr>
    </table>

    <table border="0" cellpadding="0" cellspacing="0" class="module" data-role="module-button" data-type="button" role="module" style="table-layout:fixed;" width="100%">
        <tbody>
            <tr>
                <td align="center" bgcolor="" class="outer-td" style="padding:0px 0px 0px 0px;">
                    <table border="0" cellpadding="0" cellspacing="0" class="button-css__deep-table___2OZyb wrapper-mobile" style="text-align:center;">
                        <tbody>
                            <tr>
                                <td align="center" bgcolor="#1a82e2" class="inner-td" style="border-radius:6px;font-size:16px;text-align:center;background-color:inherit;">
                                    <a href="${link}" style="background-color:#2F3760;border:1px solid #333333;border-color:#1a82e2;border-radius:6px;border-width:1px;color:#ffffff;display:inline-block;font-family:arial,helvetica,sans-serif;font-size:16px;font-weight:700;letter-spacing:0px;line-height:16px;padding:12px 18px 12px 18px;text-align:center;text-decoration:none;" target="_blank">Click Here</a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </tbody>
    </table>

    <table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
        <tr>
            <td style="padding:18px 0px 0px 0px;line-height:24px;text-align:inherit;" height="100%" valign="top" bgcolor="">
                <div>
                    <table border="0" cellpadding="0" cellspacing="0" style="width: 100%; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 300; font-family: arial; font-size: 14px; color: rgb(0, 0, 0);" width="100%">
                    	<tbody style="font-size: 14px;">
                    		<tr style="font-size: 14px;">
                    			<td align="left" bgcolor="#ffffff" style="padding: 24px; line-height: 24px; font-family: &quot;Source Sans Pro&quot;, Helvetica, Arial, sans-serif; font-size: 16px;">
    		                        <p style="margin-bottom: 0px;"><span style="font-size:16px;">
                                        <span style="font-family:arial,helvetica,sans-serif;">
                                            If that doesn&#39;t work, copy and paste the following link&nbsp;
                                        </span>
                                        <span style="font-family:arial,helvetica,sans-serif;">
                                            <span style="font-size:16px;">in</span>
                                        </span>
                                        <span style="font-size:16px;">
                                            <span style="font-family:arial,helvetica,sans-serif;">
                                                &nbsp;your browser:
                                            </span>
                                        </span>
                                    </p>
                        
    		                        <p style="margin-bottom: 0px;">
                                        <span style="font-size:16px;">
                                            <span style="font-family:arial,helvetica,sans-serif;">
                                                <span style="font-size: 18px; line-break:anywhere;">
                                                    ${link}
                                                </span>
                                            </span>
                                        </span>
                                    </p>
    	                    	</td>
    	                    </tr>
    	                    <tr style="font-size: 14px;">
    	                    	<td align="left" bgcolor="#ffffff" style="padding: 24px; line-height: 24px; font-family: &quot;Source Sans Pro&quot;, Helvetica, Arial, sans-serif; font-size: 16px;">
    	                    	    <p style="margin-bottom: 0px;">
                                        <span style="font-size:16px;">
                                            <span style="font-family:arial,helvetica,sans-serif;">
                                                1000FiX Team
                                            </span>
                                        </span>
                                    </p>
    	                    	</td>
    	                    </tr>
                    	</tbody>
                    </table>
                </div>
            </td>
        </tr>
    </table>`;
}
function send_reset_email(link, username, email) {
    return __awaiter(this, void 0, void 0, function* () {
        const sendEmail = yield transporter.sendMail({
            to: email,
            html: mail_wrapper(reset_link_content(link, username)),
            subject: `1000FiX Inventory Reset Email`,
        });
        return sendEmail;
    });
}
