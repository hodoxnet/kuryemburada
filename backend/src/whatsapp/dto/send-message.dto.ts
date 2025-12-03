// WhatsApp Cloud API Send Message DTOs

export interface SendTextMessageDto {
  to: string;
  text: string;
  previewUrl?: boolean;
}

export interface SendButtonMessageDto {
  to: string;
  bodyText: string;
  buttons: ButtonItem[];
  headerText?: string;
  footerText?: string;
}

export interface ButtonItem {
  id: string;
  title: string; // Max 20 characters
}

export interface SendListMessageDto {
  to: string;
  bodyText: string;
  buttonText: string; // Max 20 characters
  sections: ListSection[];
  headerText?: string;
  footerText?: string;
}

export interface ListSection {
  title?: string; // Max 24 characters
  rows: ListRow[];
}

export interface ListRow {
  id: string;
  title: string; // Max 24 characters
  description?: string; // Max 72 characters
}

export interface SendLocationRequestDto {
  to: string;
  bodyText: string;
}

export interface SendLocationMessageDto {
  to: string;
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}

export interface SendImageMessageDto {
  to: string;
  imageUrl?: string;
  imageId?: string;
  caption?: string;
}

export interface SendDocumentMessageDto {
  to: string;
  documentUrl?: string;
  documentId?: string;
  caption?: string;
  filename?: string;
}

export interface SendTemplateMessageDto {
  to: string;
  templateName: string;
  languageCode: string;
  components?: TemplateComponent[];
}

export interface TemplateComponent {
  type: 'header' | 'body' | 'button';
  parameters?: TemplateParameter[];
  sub_type?: 'quick_reply' | 'url';
  index?: number;
}

export interface TemplateParameter {
  type: 'text' | 'currency' | 'date_time' | 'image' | 'document' | 'video';
  text?: string;
  currency?: {
    fallback_value: string;
    code: string;
    amount_1000: number;
  };
  date_time?: {
    fallback_value: string;
  };
  image?: {
    link: string;
  };
  document?: {
    link: string;
  };
  video?: {
    link: string;
  };
}

// Meta Cloud API Request Bodies
export interface WhatsAppApiTextMessage {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'text';
  text: {
    preview_url: boolean;
    body: string;
  };
}

export interface WhatsAppApiInteractiveMessage {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'interactive';
  interactive: {
    type: 'button' | 'list' | 'location_request_message';
    header?: {
      type: 'text';
      text: string;
    };
    body: {
      text: string;
    };
    footer?: {
      text: string;
    };
    action: InteractiveAction;
  };
}

export interface InteractiveAction {
  buttons?: {
    type: 'reply';
    reply: {
      id: string;
      title: string;
    };
  }[];
  button?: string;
  sections?: {
    title?: string;
    rows: {
      id: string;
      title: string;
      description?: string;
    }[];
  }[];
  name?: string; // 'send_location' for location request
}

export interface WhatsAppApiLocationMessage {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'location';
  location: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
}

export interface WhatsAppApiTemplateMessage {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'template';
  template: {
    name: string;
    language: {
      code: string;
    };
    components?: TemplateComponent[];
  };
}

// API Response
export interface WhatsAppApiResponse {
  messaging_product: string;
  contacts: {
    input: string;
    wa_id: string;
  }[];
  messages: {
    id: string;
  }[];
}

export interface WhatsAppApiError {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id: string;
  };
}
