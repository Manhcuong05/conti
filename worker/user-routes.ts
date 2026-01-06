import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, ApplicationEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import { SERVICES, PRICING_TIERS } from "@shared/mock-data";
import type { CompanyCheckResult, OnboardingData, OnboardingResponse, Application, CompanyRegistryEntry } from "@shared/types";
import { COMPANY_REGISTRY } from "@shared/company-registry";
import { normalizeBusinessName, calculateSimilarity } from "./string-utils";
type CompanySearchItem = { name: string; taxCode?: string; address?: string };

function deriveName(entry: CompanyRegistryEntry): string | null {
  const rawName = entry.name?.trim() ?? '';
  if (rawName.length >= 3 && !/^\d+$/.test(rawName)) return rawName;
  const addr = entry.address ?? '';
  if (!addr) return null;
  // lấy dòng đầu tiên trước khi xuống dòng / khoảng trắng dư
  const firstLine = addr.split(/\r?\n/).map((s) => s.trim()).find((s) => s.length > 3);
  if (firstLine && !/^\d+$/.test(firstLine)) return firstLine;
  return null;
}

const PREPARED_REGISTRY: { entry: CompanyRegistryEntry; normalizedName: string }[] = Array.isArray(COMPANY_REGISTRY)
  ? COMPANY_REGISTRY
    .map((entry) => {
      const derivedName = deriveName(entry);
      if (!derivedName) return null;
      return { entry: { ...entry, name: derivedName }, normalizedName: normalizeBusinessName(derivedName) };
    })
    .filter((e): e is { entry: CompanyRegistryEntry; normalizedName: string } => !!e && e.normalizedName.length > 0)
  : [];
const MOCK_REGISTRY = [
  { name: "CÔNG TY TNHH CONTI", taxCode: "0101234567", address: "Tòa nhà Lotte Center, 54 Liễu Giai, Ba Đình, Thành phố Hà Nội", status: "Đang hoạt động" },
  { name: "CÔNG TY CỔ PHẦN TẬP ĐOÀN VINGROUP", taxCode: "0102030405", address: "Số 7 Đường Bằng Lăng 1, KĐT Vinhomes Riverside, Long Biên, Thành phố Hà Nội", status: "Đang hoạt động" },
  { name: "CÔNG TY CỔ PHẦN MASAN", taxCode: "0305060708", address: "Tòa nhà Central Plaza, 17 Lê Duẩn, Quận 1, Thành phố Hồ Chí Minh", status: "Đang hoạt động" },
  { name: "CÔNG TY TNHH ABC", taxCode: "0109988776", address: "Số 123 Phố Duy Tân, Cầu Giấy, Thành phố Hà Nội", status: "Đang hoạt động" },
  { name: "CÔNG TY CỔ PHẦN FPT", taxCode: "0100234567", address: "Số 17 Duy Tân, P. Dịch Vọng Hậu, Q. Cầu Giấy, Thành phố Hà Nội", status: "Đang hoạt động" },
  { name: "CÔNG TY TNHH ĐẤT XANH", taxCode: "0303030303", address: "2W Ung Văn Khiêm, P. 25, Q. Bình Thạnh, Thành phố Hồ Chí Minh", status: "Đang hoạt động" }
];
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/test', (c) => c.json({ success: true, data: { name: 'CONTI Workers API' } }));
  // USERS
  app.get('/api/users', async (c) => {
    await UserEntity.ensureSeed(c.env);
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    const page = await UserEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : undefined);
    return ok(c, page);
  });
  app.post('/api/users', async (c) => {
    const { name } = (await c.req.json()) as { name?: string };
    if (!name?.trim()) return bad(c, 'Yêu cầu tên người dùng');
    return ok(c, await UserEntity.create(c.env, { id: crypto.randomUUID(), name: name.trim() }));
  });
  // CONTI ROUTES
  app.get('/api/services', (c) => ok(c, SERVICES));
  app.get('/api/pricing', (c) => ok(c, PRICING_TIERS));

  // Tra cứu doanh nghiệp từ dữ liệu cục bộ (COMPANY_REGISTRY)
  app.get('/api/company-search', (c) => {
    try {
      const q = c.req.query('q')?.trim() ?? '';
      if (q.length < 2) return ok(c, []);

      const normalizedQuery = normalizeBusinessName(q);
      const matches = PREPARED_REGISTRY
        .map((item) => {
          const contains = item.normalizedName.includes(normalizedQuery);
          const similarity = calculateSimilarity(normalizedQuery, item.normalizedName);
          const score = contains ? similarity + 0.5 : similarity;
          return { entry: item.entry, score, contains };
        })
        .filter((m) => m.contains || m.score > 0.45)
        .sort((a, b) => b.score - a.score)
        .slice(0, 15)
        .map((m) => m.entry);

      return ok(c, matches);
    } catch (e) {
      console.error('[company-search] error', e);
      return bad(c, 'Không thể tra cứu doanh nghiệp. Vui lòng thử lại.');
    }
  });
  //
  app.post('/api/check-name', async (c) => {
    const { companyName } = (await c.req.json()) as { companyName?: string };
    if (!companyName || companyName.trim().length < 3) {
      return bad(c, 'Tên công ty phải có ít nhất 3 ký tự');
    }
    await new Promise(resolve => setTimeout(resolve, 1500));
    const inputNormalized = normalizeBusinessName(companyName);
    const matches = PREPARED_REGISTRY.filter((item) => item.normalizedName === inputNormalized)
      .slice(0, 10)
      .map((item) => {
        const { name, msdn, msnb, address, status } = item.entry;
        return {
          name,
          taxCode: msdn || msnb || '',
          address: address || '',
          status: status || ''
        };
      });
    if (matches.length > 0) {
      const result: CompanyCheckResult = {
        status: 'duplicate',
        message: 'Tên doanh nghiệp đã tồn tại trong cơ sở dữ liệu. Vui lòng chọn tên khác.',
        details: matches
      };
      return ok(c, result);
    }
    return ok(c, {
      status: 'available',
      message: 'Chúc mừng! Tên doanh nghiệp này hiện đang khả dụng và sẵn sàng đăng ký.'
    } as CompanyCheckResult);
  });
  // Get application by ID (reference number)
  app.get('/api/applications/:id', async (c) => {
    const id = c.req.param('id');
    const entity = new ApplicationEntity(c.env, id);
    if (!(await entity.exists())) {
      return notFound(c, 'Hồ sơ không tồn tại');
    }
    const state = await entity.getState();
    return ok(c, state);
  });
  app.post('/api/onboarding/submit', async (c) => {
    try {
      const data = (await c.req.json()) as OnboardingData;
      // Mandatory validation including new businessSectors field
      // Validate required fields for new registration structure
      if (!data.companyNameVi || !data.companyNameEn || !data.address || !data.phone || !data.email) {
        return bad(c, 'Vui lòng cung cấp đầy đủ thông tin công ty và liên hệ');
      }
      if (!data.businessLines || !data.vatMethod) {
        return bad(c, 'Vui lòng cung cấp thông tin ngành nghề và phương pháp tính thuế');
      }
      if (!data.charterCapital || !data.capitalCompletionDate) {
        return bad(c, 'Vui lòng cung cấp thông tin vốn điều lệ');
      }
      if (!data.legalRepresentative || !data.legalRepresentative.name) {
        return bad(c, 'Vui lòng cung cấp thông tin người đại diện pháp luật');
      }
      if (!data.founders || data.founders.length === 0) {
        return bad(c, 'Vui lòng cung cấp thông tin sáng lập viên/cổ đông');
      }

      // Validate founders ownership
      const totalOwnership = data.founders.reduce((sum, f) => sum + (f.ownershipPercentage || 0), 0);
      if (Math.abs(totalOwnership - 100) > 0.1) {
        return bad(c, `Tổng tỷ lệ sở hữu phải bằng 100% (hiện tại: ${totalOwnership.toFixed(2)}%)`);
      }

      const referenceNumber = `CONTI-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      const application: Application = {
        ...data,
        id: referenceNumber,
        status: 'pending',
        submittedAt: Date.now()
      };
      await ApplicationEntity.create(c.env, application);
      const response: OnboardingResponse = {
        referenceNumber,
        message: 'Yêu cầu của bạn đã được tiếp nhận. Chuyên viên CONTI sẽ liên hệ tư vấn trong vòng 30 phút làm việc.',
        application
      };
      return ok(c, response);
    } catch (e) {
      console.error('[SUBMIT ERROR]', e);
      return bad(c, 'Lỗi hệ thống khi xử lý hồ sơ. Vui lòng thử lại sau.');
    }
  });

  // Telegram notification endpoint
  app.post('/api/telegram/notify', async (c) => {
    try {
      const { type, email, name, phone, message } = (await c.req.json()) as {
        type: 'consultation' | 'contact';
        email?: string;
        name?: string;
        phone?: string;
        message?: string;
      };

      // Mock Telegram Bot integration
      // In production, this would send to actual Telegram Bot API
      // Example: https://api.telegram.org/bot<BOT_TOKEN>/sendMessage

      let telegramMessage = '';
      if (type === 'consultation') {
        telegramMessage = `🔔 New Consultation Request:\nEmail: ${email || 'N/A'}`;
      } else if (type === 'contact') {
        telegramMessage = `📩 New Contact Form Submission:\nName: ${name || 'N/A'}\nEmail: ${email || 'N/A'}\nPhone: ${phone || 'N/A'}\nMessage: ${message || 'N/A'}`;
      }

      // Log to console (in production, replace with actual Telegram API call)
      console.log('[TELEGRAM NOTIFICATION]', telegramMessage);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return ok(c, { message: 'Notification sent successfully', telegramMessage });
    } catch (e) {
      console.error('[TELEGRAM ERROR]', e);
      return bad(c, 'Failed to send notification');
    }
  });

  // Translation endpoint (LLM integration - mock)
  app.post('/api/translate', async (c) => {
    try {
      const { text, sourceLang, targetLang } = (await c.req.json()) as {
        text: string;
        sourceLang: string;
        targetLang: string;
      };

      // Mock translation - in production, integrate with LLM or translation API
      // Example: OpenAI, Google Translate, or custom LLM
      let translatedText = text.toUpperCase();

      if (targetLang === 'en' && sourceLang === 'vi') {
        // Simple mock: convert Vietnamese to English format
        translatedText = text
          .toUpperCase()
          .replace(/CÔNG TY /g, '')
          .replace(/TNHH /g, '')
          .trim() + ' COMPANY LIMITED';
      }

      console.log('[TRANSLATION]', { text, sourceLang, targetLang, translatedText });

      return ok(c, {
        translatedText,
        sourceLang,
        targetLang
      });
    } catch (e) {
      console.error('[TRANSLATION ERROR]', e);
      return bad(c, 'Translation service error');
    }
  });

  // VNPay create payment URL (mock)
  app.post('/api/payment/vnpay/create', async (c) => {
    try {
      const { amount, orderInfo, referenceNumber } = (await c.req.json()) as {
        amount: number;
        orderInfo: string;
        referenceNumber: string;
      };

      // Mock VNPay integration
      // In production, this would:
      // 1. Generate proper VNPay parameters with signature
      // 2. Use TMN Code and Hash Secret from environment
      // 3. Return actual VNPay payment URL

      const mockPaymentUrl = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=${amount * 100}&vnp_Command=pay&vnp_TxnRef=${referenceNumber}&vnp_OrderInfo=${encodeURIComponent(orderInfo)}`;

      console.log('[VNPAY CREATE]', { amount, orderInfo, referenceNumber });

      return ok(c, {
        paymentUrl: mockPaymentUrl,
        referenceNumber
      });
    } catch (e) {
      console.error('[VNPAY CREATE ERROR]', e);
      return bad(c, 'Payment service error');
    }
  });

  // VNPay IPN callback handler (mock)
  app.get('/api/payment/vnpay/callback', async (c) => {
    try {
      const params = c.req.query();

      // Mock VNPay callback handling
      // In production, this would:
      // 1. Validate signature using Hash Secret
      // 2. Update order/application status in database
      // 3. Send confirmation to user
      // 4. Return proper response to VNPay

      console.log('[VNPAY CALLBACK]', params);

      const responseCode = params.vnp_ResponseCode || '00';
      const txnRef = params.vnp_TxnRef || '';

      if (responseCode === '00') {
        // Payment successful
        return c.redirect(`/portal?payment=success&ref=${txnRef}`);
      } else {
        // Payment failed
        return c.redirect(`/portal?payment=failed&code=${responseCode}`);
      }
    } catch (e) {
      console.error('[VNPAY CALLBACK ERROR]', e);
      return c.redirect('/portal?payment=error');
    }
  });


  app.post('/api/lead', async (c) => ok(c, { message: 'Lead đã được tiếp nhận thành công' }));
  app.post('/api/subscribe', async (c) => ok(c, { message: 'Đăng ký nhận tin thành công' }));
}
