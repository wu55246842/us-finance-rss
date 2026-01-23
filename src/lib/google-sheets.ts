import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

async function getAuthClient() {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!email || !key) {
        throw new Error('Google service account credentials missing in .env');
    }

    const auth = new google.auth.JWT({
        email,
        key,
        scopes: SCOPES,
    });
    return auth;
}

export async function appendToSheet(spreadsheetId: string, range: string, values: any[][]) {
    try {
        const auth = await getAuthClient();
        const sheets = google.sheets({ version: 'v4', auth });

        const response = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values,
            },
        });

        return response.data;
    } catch (error) {
        console.error('Error in appendToSheet:', error);
        throw error;
    }
}
