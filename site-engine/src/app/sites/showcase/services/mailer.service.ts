import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class MailerService {
  private readonly SERVICE_ID = environment.emailJs.serviceId;
  private readonly TEMPLATE_ID = environment.emailJs.templateId;
  private readonly PUBLIC_KEY = environment.emailJs.publicKey;

  /**
   * Sends the form metadata using EmailJS
   */
  async sendContactEmail(
    name: string,
    email: string,
    message: string,
    targetEmail: string,
  ) {
    const templateParams = {
      from_name: name,
      from_email: email,
      message: message,
      receiving_email: targetEmail,
    };

    try {
      const response = await emailjs.send(
        this.SERVICE_ID,
        this.TEMPLATE_ID,
        templateParams,
        this.PUBLIC_KEY,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
}