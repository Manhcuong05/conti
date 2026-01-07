/**
 * Vietnamese to English translation dictionary for company names
 * Used for translating business names before appending company type suffix
 */

interface TranslationDictionary {
    [key: string]: string;
}

// Common Vietnamese business words and their English translations
export const TRANSLATION_DICT: TranslationDictionary = {
    // Common business terms
    'PHÁT TRIỂN': 'DEVELOPMENT',
    'CÔNG NGHỆ': 'TECHNOLOGY',
    'THƯƠNG MẠI': 'TRADING',
    'DỊCH VỤ': 'SERVICE',
    'TƯ VẤN': 'CONSULTING',
    'GIẢI PHÁP': 'SOLUTIONS',
    'ĐẦU TƯ': 'INVESTMENT',
    'SẢN XUẤT': 'MANUFACTURING',
    'XÂY DỰNG': 'CONSTRUCTION',
    'VẬN TẢI': 'TRANSPORTATION',
    'DU LỊCH': 'TRAVEL',
    'GIÁO DỤC': 'EDUCATION',
    'Y TẾ': 'HEALTHCARE',
    'NÔNG NGHIỆP': 'AGRICULTURE',
    'THỰC PHẨM': 'FOOD',
    'ĐỒ UỐNG': 'BEVERAGE',
    'NHẬP KHẨU': 'IMPORT',
    'XUẤT KHẨU': 'EXPORT',
    'BẤT ĐỘNG SẢN': 'REAL ESTATE',
    'TÀI CHÍNH': 'FINANCIAL',
    'VIỄN THÔNG': 'TELECOMMUNICATIONS',
    'TRUYỀN THÔNG': 'MEDIA',
    'QUẢNG CÁO': 'ADVERTISING',
    'MARKETING': 'MARKETING',
    'LOGISTICS': 'LOGISTICS',
    'KHO VẬN': 'WAREHOUSE',

    // Technology terms
    'PHẦN MẦM': 'SOFTWARE',
    'PHẦN CỨNG': 'HARDWARE',
    'ỨNG DỤNG': 'APPLICATION',
    'HỆ THỐNG': 'SYSTEM',
    'MẠNG': 'NETWORK',
    'DỮ LIỆU': 'DATA',
    'AN NINH': 'SECURITY',
    'ĐIỆN TỬ': 'ELECTRONIC',
    'TỰ ĐỘNG HÓA': 'AUTOMATION',
    'TRÍ TUỆ NHÂN TẠO': 'ARTIFICIAL INTELLIGENCE',
    'AI': 'AI',

    // Common words
    'QUỐC TẾ': 'INTERNATIONAL',
    'TOÀN CẦU': 'GLOBAL',
    'VIỆT NAM': 'VIETNAM',
    'HÀ NỘI': 'HANOI',
    'HỒ CHÍ MINH': 'HO CHI MINH',
    'THÀNH PHỐ': 'CITY',
    'TRUNG TÂM': 'CENTER',
    'TẬP ĐOÀN': 'GROUP',
    'LIÊN DOANH': 'JOINT VENTURE',

    // Login/access related
    'ĐĂNG NHẬP': 'LOGIN',
    'ĐĂNG KÝ': 'REGISTER',
    'TRUY CẬP': 'ACCESS',
    'BẰNG': 'WITH',
    'VỚI': 'WITH',
    'QUA': 'VIA',
    'BẰNG CÁCH': 'BY',

    // Numbers in Vietnamese
    'MỘT': '1',
    'HAI': '2',
    'BA': '3',
    'BỐN': '4',
    'NĂM': '5',
    'SÁU': '6',
    'BẢY': '7',
    'TÁM': '8',
    'CHÍN': '9',
    'MƯỜI': '10',

    // Brand names (keep as-is)
    'GOOGLE': 'GOOGLE',
    'FACEBOOK': 'FACEBOOK',
    'MICROSOFT': 'MICROSOFT',
    'APPLE': 'APPLE',
    'SAMSUNG': 'SAMSUNG',
    'FPT': 'FPT',
    'VINGROUP': 'VINGROUP',
    'VIETTEL': 'VIETTEL',
};

/**
 * Translates Vietnamese company name to English using dictionary
 * Falls back to original text if no translation found
 */
export function translateCompanyName(vietnameseName: string): string {
    let result = vietnameseName.toUpperCase();
    
    // Replace using dictionary - sorting by length ensures multi-word phrases are matched first
    const sortedEntries = Object.entries(TRANSLATION_DICT).sort((a, b) => b[0].length - a[0].length);
    
    for (const [viWord, enWord] of sortedEntries) {
        // Use regex for global replacement
        const regex = new RegExp(viWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        result = result.replace(regex, enWord);
    }
    
    return result;
}

/**
 * Smart translation that handles common patterns in Vietnamese company names
 */
export function smartTranslateCompanyName(text: string): string {
    let result = text.toUpperCase();

    // Remove common Vietnamese company type prefixes
    result = result
        .replace(/^CÔNG TY TNHH MỘT THÀNH VIÊN\s*/i, '')
        .replace(/^CÔNG TY TNHH 1 THÀNH VIÊN\s*/i, '')
        .replace(/^CÔNG TY TNHH\s*/i, '')
        .replace(/^CÔNG TY CỔ PHẦN\s*/i, '')
        .replace(/^CÔNG TY\s*/i, '');

    // Translate the core name
    const translated = translateCompanyName(result.trim());

    // Determine the appropriate English company type suffix
    const original = text.toUpperCase();
    let suffix = ' COMPANY LIMITED';

    if (original.includes('CỔ PHẦN')) {
        suffix = ' JOINT STOCK COMPANY';
    } else if (original.includes('TNHH') || original.includes('MỘT THÀNH VIÊN') || original.includes('1 THÀNH VIÊN')) {
        suffix = ' COMPANY LIMITED';
    }

    return translated + suffix;
}
