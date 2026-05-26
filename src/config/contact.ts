// Global Contact Configuration
// This file is the SINGLE SOURCE OF TRUTH for all contact details across the website.
// Update values here to change contact information everywhere.

export interface ContactDetails {
    address: {
        full: string;
        line1: string;
        line2: string;
        city: string;
        district: string;
        pincode: string;
    };
    phone: {
        display: string;
        raw: string;
        link: string;
    };
    email: {
        display: string;
        link: string;
    };
    social?: {
        instagram?: string;
        facebook?: string;
        youtube?: string;
        twitter?: string;
    };
    businessHours?: {
        weekdays: string;
        saturday: string;
        sunday: string;
    };
}

export const contactConfig: ContactDetails = {
    address: {
        full: "No-6, Melasooriyathotam, Madukkur, Pattukottai, Tanjavur - 614903",
        line1: "No-6, Melasooriyathotam",
        line2: "Madukkur, Pattukottai",
        city: "Pattukottai",
        district: "Tanjavur",
        pincode: "614903",
    },
    phone: {
        display: "+91 93635 99577",
        raw: "+919363599577",
        link: "tel:+919363599577",
    },
    email: {
        display: "blackpistongarages@gmail.com",
        link: "mailto:blackpistongarages@gmail.com",
    },
    social: {
        instagram: "https://www.instagram.com/blackpistongarages?igsh=MW56aGpiOGFxZWJjbg==",
        facebook: "https://facebook.com/blackpistongarage",
        youtube: "https://youtube.com/@blackpistongarage",
    },
    businessHours: {
        weekdays: "9:00 AM - 8:00 PM",
        saturday: "9:00 AM - 6:00 PM",
        sunday: "Closed",
    },
};

// Helper function for formatted address
export const getFormattedAddress = (): string => {
    return contactConfig.address.full;
};

// Helper function for phone link
export const getPhoneLink = (): string => {
    return contactConfig.phone.link;
};

// Helper function for email link
export const getEmailLink = (): string => {
    return contactConfig.email.link;
};

export default contactConfig;
