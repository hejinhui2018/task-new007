export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
}

export interface ChapterSection {
  heading: string;
  paragraphs: string[];
}

export interface Chapter {
  id: string;
  title: string;
  summary: string;
  durationMinutes: number;
  sections: ChapterSection[];
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  chapters: Chapter[];
  quiz: {
    id: string;
    title: string;
    description: string;
    passScore: number;
    questions: QuizQuestion[];
  };
}

export const course: Course = {
  id: 'info-security-101',
  title: '信息安全意识培训',
  subtitle: '2026 年度全员必修课',
  description:
    '面向全体员工的信息安全基础课程，覆盖账号密码、钓鱼邮件识别与数据外发规范。完成全部三章并通过结业测验后，将计入年度合规培训记录。',
  chapters: [
    {
      id: 'ch1',
      title: '密码与账号安全',
      summary: '了解凭证泄露的常见途径，掌握强密码、密码管理器与多因素认证的正确用法。',
      durationMinutes: 12,
      sections: [
        {
          heading: '为什么账号安全是第一道防线',
          paragraphs: [
            '在大多数企业数据泄露事件中，攻击者最先下手的并不是复杂的系统漏洞，而是员工的账号密码。弱密码、密码复用和被钓鱼网站窃取的凭证，让攻击者可以绕过层层防护，直接以“合法用户”的身份登录内部系统。',
            '对于员工而言，账号不仅代表个人身份，还关联着邮箱、文档、客户资料等一系列权限。一个账号失守，往往意味着攻击者可以以你的名义继续欺骗你的同事，造成连锁反应。',
            '因此，账号安全不是 IT 部门一个团队的事，而是每位员工日常习惯的总和。本章介绍的三个做法——强密码、密码管理器和多因素认证——是投入最小、收益最大的防护措施。',
          ],
        },
        {
          heading: '强密码与密码管理器',
          paragraphs: [
            '强密码的核心是长度和唯一性。相比复杂的符号替换，更长的密码（例如 16 位以上）更难被暴力破解；而为每个系统使用不同的密码，可以避免一个网站泄露后波及其他系统。',
            '人脑无法记住几十个不同的长密码，这正是密码管理器存在的意义。公司统一采购的密码管理器可以为每个网站生成随机密码并自动填充，你只需要记住一个足够强的主密码。',
            '需要避免的做法包括：把密码写在便签或明文文档里、通过聊天工具发送密码，以及在浏览器弹出的“是否保存密码”中保存公司核心系统的密码。',
          ],
        },
        {
          heading: '多因素认证（MFA）',
          paragraphs: [
            '多因素认证要求你在密码之外，再提供一种“你拥有的东西”（如手机动态口令、硬件密钥）或“你本身的特征”（如指纹）。即使密码泄露，攻击者也无法仅凭密码登录。',
            '公司为所有核心系统开启了 MFA。请优先使用硬件密钥或验证器 App 生成的动态口令，短信验证码仅作为兜底方案，因为它可能受到 SIM 卡劫持攻击。',
            '如果你频繁收到自己没有发起的 MFA 确认请求，不要图省事点“通过”——这很可能是攻击者正在尝试登录你的账号（MFA 疲劳攻击）。应立即拒绝、修改密码并上报安全团队。',
          ],
        },
      ],
    },
    {
      id: 'ch2',
      title: '识别钓鱼邮件',
      summary: '拆解钓鱼邮件的典型特征，学会处理可疑链接与附件，并掌握正确的上报流程。',
      durationMinutes: 15,
      sections: [
        {
          heading: '钓鱼邮件的常见特征',
          paragraphs: [
            '钓鱼邮件最常用的手法是制造紧迫感：“账号即将冻结”“奖金待领取”“老板急要一份文件”。越是催促你立刻操作的邮件，越值得停下来多看一眼。',
            '其次看发件人。攻击者常使用与官方域名形似的地址，例如把 “company.com” 写成 “cornpany.com” 或 “company-support.net”。把鼠标悬停在发件人名称上，核对完整地址。',
            '此外，异常的称呼（如“尊敬的用户”而非你的名字）、与内容不符的附件、要求绕过正常流程（“这件事先别走 OA”）都是危险信号。',
          ],
        },
        {
          heading: '可疑链接与附件的处理',
          paragraphs: [
            '不要直接点击邮件中的链接。将鼠标悬停在链接上，查看状态栏显示的真实地址是否与声称的官网一致；在手机上可以长按链接预览。',
            '对于附件，尤其是带有宏的 Office 文档、压缩包中的可执行文件，要格外小心。公司邮件网关会扫描附件，但没有任何系统能保证百分之百拦截。',
            '如果确实需要访问邮件中的链接，稳妥的做法是手动在浏览器输入官方网址，或通过公司内部导航进入，而不是使用邮件里给出的地址。',
          ],
        },
        {
          heading: '遇到可疑邮件怎么办',
          paragraphs: [
            '不要回复、不要转发给同事“帮忙看看”，更不要点击邮件里的“退订”链接——这些行为都会告诉攻击者你的邮箱是活跃的。',
            '使用邮件客户端中的“举报钓鱼邮件”按钮，或转发至 security@example.com。安全团队会在工作时间两小时内响应，并告知你后续处理结果。',
            '如果已经点击了链接或输入了密码，请立即修改密码并联系安全团队。及时上报不会被追责，隐瞒不报才会让小问题变成大事故。',
          ],
        },
      ],
    },
    {
      id: 'ch3',
      title: '数据分类与外发安全',
      summary: '认识公司的数据分级标准，掌握文件共享、外发与日常办公中的数据保护规范。',
      durationMinutes: 10,
      sections: [
        {
          heading: '公司的数据分级',
          paragraphs: [
            '公司将数据分为四级：公开数据（官网资料、公开新闻稿）、内部数据（一般工作文档）、机密数据（客户信息、合同、未公开的财务数据）和绝密数据（核心源代码、密钥、并购信息）。',
            '不同级别的数据对应不同的存储和传输要求。机密及以上级别的数据必须存放在公司指定的系统中，禁止保存到个人网盘、个人邮箱或未经备案的设备。',
            '拿不准一份文件属于哪个级别时，按更高一级处理，或咨询你的主管和数据保护负责人。',
          ],
        },
        {
          heading: '安全地共享与外发',
          paragraphs: [
            '共享遵循“最小必要”原则：只共享对方完成工作所必需的内容，只开放必需的权限（能看就不给编辑），并设置访问有效期。',
            '对外发送机密文件前，需要主管审批，并使用公司加密外发通道。禁止使用个人微信、个人邮箱传输公司文件。',
            '通过链接共享时，确认链接的访问范围（“仅指定人员”而非“任何人可查看”），并在项目结束后及时关闭外链。',
          ],
        },
        {
          heading: '日常习惯与责任',
          paragraphs: [
            '离开工位时锁屏（Win + L / Ctrl + Cmd + Q），打印的敏感文件及时取走并按规定碎纸处理，会议室白板拍照后记得擦除。',
            '离职或调岗时，按要求归还设备并移交数据，不得私自拷贝公司资料。公司会对重要数据的访问和外发进行审计。',
            '数据安全事件并非纯粹的“技术问题”，每一次违规外发都可能给客户和公司带来实际损失，也会依据员工手册追究相应责任。',
          ],
        },
      ],
    },
  ],
  quiz: {
    id: 'final-quiz',
    title: '课程结业测验',
    description: '4 道单选题，75 分及格，可重复作答。作答过程中草稿会自动保存，可以随时离开再继续。',
    passScore: 75,
    questions: [
      {
        id: 'q1',
        text: '收到自称“IT 服务台”的邮件，称你的账号异常，要求点击链接在 30 分钟内重置密码，否则将被锁定。最稳妥的做法是？',
        options: [
          { id: 'a', text: '立即点击链接完成重置，避免账号被锁' },
          { id: 'b', text: '不点击链接，通过公司内部通讯录中的官方渠道联系 IT 核实' },
          { id: 'c', text: '回复邮件询问对方的工号和姓名' },
          { id: 'd', text: '转发到部门群里请大家帮忙判断' },
        ],
        correctOptionId: 'b',
        explanation:
          '钓鱼邮件惯用“限时”“冻结”等话术制造紧迫感。涉及账号操作，应通过公司内部通讯录中的官方渠道核实，而不是点击邮件中的链接。',
      },
      {
        id: 'q2',
        text: '以下哪种密码习惯最安全？',
        options: [
          { id: 'a', text: '用公司英文名加年份，好记就行' },
          { id: 'b', text: '所有系统使用同一个高强度密码' },
          { id: 'c', text: '用密码管理器为每个系统生成并保存不同的长密码' },
          { id: 'd', text: '把密码记在便签上贴在显示器边框' },
        ],
        correctOptionId: 'c',
        explanation:
          '密码管理器可以为每个系统生成并保存不同的长密码，既避免复用，也无需死记硬背。公司已为全员采购企业版密码管理器。',
      },
      {
        id: 'q3',
        text: '出差时在机场连接公共 Wi-Fi 处理工作，正确的做法是？',
        options: [
          { id: 'a', text: '连上就直接处理，反正只用几分钟' },
          { id: 'b', text: '连接公司 VPN 后再访问内部系统和文件' },
          { id: 'c', text: '先把文件发到个人邮箱再处理' },
          { id: 'd', text: '请邻座同事开热点给你用' },
        ],
        correctOptionId: 'b',
        explanation:
          '公共 Wi-Fi 可能被监听或仿冒。处理工作前连接公司 VPN，可以为传输加密，避免会话和文件被窃取。',
      },
      {
        id: 'q4',
        text: '你不小心把包含客户手机号的表格发给了外部人员，第一步应该怎么做？',
        options: [
          { id: 'a', text: '立即上报安全团队和直属主管，按流程处置' },
          { id: 'b', text: '默默撤回邮件，当作没发生' },
          { id: 'c', text: '私下联系对方请其删除，先不声张' },
          { id: 'd', text: '观察几天，对方没反应就算了' },
        ],
        correctOptionId: 'a',
        explanation:
          '误发敏感数据后，第一时间上报安全团队，才能及时采取撤回、通知客户等补救措施。隐瞒不报会错过最佳处置时机。',
      },
    ],
  },
};

export function getChapter(chapterId: string | undefined): Chapter | undefined {
  return course.chapters.find((c) => c.id === chapterId);
}

export function getChapterIndex(chapterId: string): number {
  return course.chapters.findIndex((c) => c.id === chapterId);
}
