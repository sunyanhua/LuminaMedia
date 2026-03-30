const { faker } = require('@faker-js/faker/locale/zh_CN');
const { createObjectCsvWriter } = require('csv-writer');
const fs = require('fs');
const path = require('path');

// 配置
const args = process.argv.slice(2);
let NUM_CUSTOMERS = 10000;

// 解析命令行参数
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--size' && args[i + 1]) {
    const size = args[i + 1].toLowerCase();
    if (size === 'small') NUM_CUSTOMERS = 100;
    else if (size === 'medium') NUM_CUSTOMERS = 1000;
    else if (size === 'large') NUM_CUSTOMERS = 10000;
    i++;
  } else if (args[i] === '--customers' && args[i + 1]) {
    NUM_CUSTOMERS = parseInt(args[i + 1], 10);
    i++;
  }
}
const OUTPUT_DIR = path.join(__dirname, '..', 'output');
const CUSTOMERS_CSV = path.join(OUTPUT_DIR, 'customers.csv');
const PURCHASES_CSV = path.join(OUTPUT_DIR, 'purchases.csv');
const ACTIVITIES_CSV = path.join(OUTPUT_DIR, 'activities.csv');
const SOCIAL_CSV = path.join(OUTPUT_DIR, 'social.csv');

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 初始化中文Faker
faker.seed(123); // 固定随机种子，确保可重复生成

// 数据生成函数
function generateCustomerData(numRecords) {
  const customers = [];
  const startDate = new Date(2023, 0, 1); // 2023-01-01
  const endDate = new Date();

  for (let i = 0; i < numRecords; i++) {
    const id = `CUST${String(i+1).padStart(6, '0')}`;
    const gender = faker.helpers.arrayElement(['M', 'F']);
    const age = faker.number.int({ min: 18, max: 70 });
    const membershipLevel = faker.helpers.arrayElement(['bronze', 'silver', 'gold', 'platinum']);
    const registrationDate = faker.date.between({ from: startDate, to: endDate });

    // 根据会员等级设置积分范围
    let pointsRange;
    switch(membershipLevel) {
      case 'bronze': pointsRange = { min: 0, max: 1000 }; break;
      case 'silver': pointsRange = { min: 1000, max: 5000 }; break;
      case 'gold': pointsRange = { min: 5000, max: 20000 }; break;
      case 'platinum': pointsRange = { min: 20000, max: 50000 }; break;
    }

    customers.push({
      id,
      name: faker.person.fullName(),
      gender,
      age,
      mobile: faker.phone.number(),
      email: faker.internet.email(),
      registration_date: registrationDate.toISOString().split('T')[0],
      membership_level: membershipLevel,
      points: faker.number.int(pointsRange),
      total_spent: faker.number.float({ min: 0, max: 100000, fractionDigits: 2 }),
      last_purchase_date: faker.date.between({ from: registrationDate, to: endDate }).toISOString().split('T')[0],
      address_district: faker.helpers.arrayElement(['Pudong', 'Jingan', 'Changning', 'Xuhui', 'Yangpu', 'Hongkou']),
      visit_frequency: faker.helpers.arrayElement(['Daily', 'Weekly', 'Biweekly', 'Monthly', 'Rarely']),
      preferred_category: faker.helpers.arrayElement(['Food & Dining', 'Fashion', 'Electronics', 'Sports & Outdoors', 'Entertainment', 'Home & Living']),
    });
  }

  return customers;
}

function generatePurchaseRecords(customers, maxPerCustomer = 50) {
  const purchases = [];
  const productCategories = ['Food & Dining', 'Fashion', 'Electronics', 'Sports & Outdoors', 'Entertainment', 'Home & Living'];
  const stores = ['Store A', 'Store B', 'Store C', 'Store D', 'Store E'];
  const paymentMethods = ['alipay', 'wechat', 'card', 'cash'];

  let purchaseId = 1;

  for (const customer of customers) {
    const numPurchases = faker.number.int({ min: 1, max: maxPerCustomer });
    const customerSince = new Date(customer.registration_date);
    const now = new Date();

    for (let i = 0; i < numPurchases; i++) {
      const purchaseDate = faker.date.between({ from: customerSince, to: now });
      const productCategory = faker.helpers.arrayElement(productCategories);
      const quantity = faker.number.int({ min: 1, max: 5 });
      const unitPrice = faker.number.float({ min: 10, max: 1000, fractionDigits: 2 });
      const totalAmount = quantity * unitPrice;

      purchases.push({
        id: `PUR${String(purchaseId).padStart(8, '0')}`,
        customer_id: customer.id,
        purchase_date: purchaseDate.toISOString(),
        store_id: faker.helpers.arrayElement(stores),
        product_category: productCategory,
        product_name: `${productCategory} Product ${faker.number.int({ min: 1, max: 100 })}`,
        quantity,
        unit_price: unitPrice,
        total_amount: totalAmount,
        payment_method: faker.helpers.arrayElement(paymentMethods),
      });

      purchaseId++;
    }
  }

  return purchases;
}

function generateActivityRecords(customers, maxPerCustomer = 10) {
  const activities = [];
  const activityTypes = ['marketing_campaign', 'coupon_used', 'survey_participated', 'event_attended'];

  let activityId = 1;

  for (const customer of customers) {
    const numActivities = faker.number.int({ min: 0, max: maxPerCustomer });
    const customerSince = new Date(customer.registration_date);
    const now = new Date();

    for (let i = 0; i < numActivities; i++) {
      const activityDate = faker.date.between({ from: customerSince, to: now });
      const activityType = faker.helpers.arrayElement(activityTypes);

      activities.push({
        id: `ACT${String(activityId).padStart(8, '0')}`,
        customer_id: customer.id,
        activity_type: activityType,
        activity_date: activityDate.toISOString().split('T')[0],
        details: JSON.stringify({
          campaign_name: activityType === 'marketing_campaign' ? faker.commerce.productName() + ' Campaign' : null,
          coupon_amount: activityType === 'coupon_used' ? faker.number.float({ min: 5, max: 100, fractionDigits: 2 }) : null,
          survey_topic: activityType === 'survey_participated' ? faker.lorem.words(3) : null,
          event_name: activityType === 'event_attended' ? faker.company.name() + ' Event' : null,
        }),
      });

      activityId++;
    }
  }

  return activities;
}

function generateSocialRecords(customers, maxPerCustomer = 20) {
  const socials = [];
  const actionTypes = ['follow', 'read', 'like', 'comment', 'share'];

  let socialId = 1;

  for (const customer of customers) {
    const numActions = faker.number.int({ min: 0, max: maxPerCustomer });
    const customerSince = new Date(customer.registration_date);
    const now = new Date();

    for (let i = 0; i < numActions; i++) {
      const actionDate = faker.date.between({ from: customerSince, to: now });
      const actionType = faker.helpers.arrayElement(actionTypes);

      socials.push({
        id: `SOC${String(socialId).padStart(8, '0')}`,
        customer_id: customer.id,
        platform: 'wechat',
        action_type: actionType,
        action_date: actionDate.toISOString(),
        content_id: `CONTENT${faker.number.int({ min: 1, max: 1000 })}`,
        content_title: faker.lorem.sentence(),
      });

      socialId++;
    }
  }

  return socials;
}

// CSV写入函数
async function writeCustomersToCsv(customers) {
  const csvWriter = createObjectCsvWriter({
    path: CUSTOMERS_CSV,
    header: [
      { id: 'id', title: 'customer_id' },
      { id: 'name', title: 'name' },
      { id: 'gender', title: 'gender' },
      { id: 'age', title: 'age' },
      { id: 'mobile', title: 'mobile' },
      { id: 'email', title: 'email' },
      { id: 'registration_date', title: 'registration_date' },
      { id: 'membership_level', title: 'membership_level' },
      { id: 'points', title: 'points' },
      { id: 'total_spent', title: 'total_spent' },
      { id: 'last_purchase_date', title: 'last_purchase_date' },
      { id: 'address_district', title: 'address_district' },
      { id: 'visit_frequency', title: 'visit_frequency' },
      { id: 'preferred_category', title: 'preferred_category' },
    ],
    encoding: 'utf8',
  });

  await csvWriter.writeRecords(customers);
  console.log(`✅ 客户数据已生成: ${CUSTOMERS_CSV} (${customers.length} 条记录)`);
}

async function writePurchasesToCsv(purchases) {
  const csvWriter = createObjectCsvWriter({
    path: PURCHASES_CSV,
    header: [
      { id: 'id', title: 'purchase_id' },
      { id: 'customer_id', title: 'customer_id' },
      { id: 'purchase_date', title: 'purchase_date' },
      { id: 'store_id', title: 'store_id' },
      { id: 'product_category', title: 'product_category' },
      { id: 'product_name', title: 'product_name' },
      { id: 'quantity', title: 'quantity' },
      { id: 'unit_price', title: 'unit_price' },
      { id: 'total_amount', title: 'total_amount' },
      { id: 'payment_method', title: 'payment_method' },
    ],
    encoding: 'utf8',
  });

  await csvWriter.writeRecords(purchases);
  console.log(`✅ 消费记录已生成: ${PURCHASES_CSV} (${purchases.length} 条记录)`);
}

async function writeActivitiesToCsv(activities) {
  const csvWriter = createObjectCsvWriter({
    path: ACTIVITIES_CSV,
    header: [
      { id: 'id', title: 'activity_id' },
      { id: 'customer_id', title: 'customer_id' },
      { id: 'activity_type', title: 'activity_type' },
      { id: 'activity_date', title: 'activity_date' },
      { id: 'details', title: 'details' },
    ],
    encoding: 'utf8',
  });

  await csvWriter.writeRecords(activities);
  console.log(`✅ 活动记录已生成: ${ACTIVITIES_CSV} (${activities.length} 条记录)`);
}

async function writeSocialToCsv(socials) {
  const csvWriter = createObjectCsvWriter({
    path: SOCIAL_CSV,
    header: [
      { id: 'id', title: 'social_id' },
      { id: 'customer_id', title: 'customer_id' },
      { id: 'platform', title: 'platform' },
      { id: 'action_type', title: 'action_type' },
      { id: 'action_date', title: 'action_date' },
      { id: 'content_id', title: 'content_id' },
      { id: 'content_title', title: 'content_title' },
    ],
    encoding: 'utf8',
  });

  await csvWriter.writeRecords(socials);
  console.log(`✅ 社交媒体记录已生成: ${SOCIAL_CSV} (${socials.length} 条记录)`);
}

// 主函数
async function main() {
  console.log('🚀 开始生成模拟数据...');
  console.log(`📊 生成 ${NUM_CUSTOMERS} 条客户数据`);

  // 生成数据
  const customers = generateCustomerData(NUM_CUSTOMERS);
  const purchases = generatePurchaseRecords(customers, 20); // 每个客户最多20条消费记录
  const activities = generateActivityRecords(customers, 5);  // 每个客户最多5条活动记录
  const socials = generateSocialRecords(customers, 10);      // 每个客户最多10条社交媒体记录

  // 写入CSV
  await writeCustomersToCsv(customers);
  await writePurchasesToCsv(purchases);
  await writeActivitiesToCsv(activities);
  await writeSocialToCsv(socials);

  // 生成统计信息
  console.log('\n📈 数据生成统计:');
  console.log(`   客户数量: ${customers.length}`);
  console.log(`   消费记录: ${purchases.length}`);
  console.log(`   活动记录: ${activities.length}`);
  console.log(`   社交媒体记录: ${socials.length}`);

  // 生成汇总报告
  const report = {
    generation_date: new Date().toISOString(),
    total_customers: customers.length,
    total_purchases: purchases.length,
    total_activities: activities.length,
    total_social: socials.length,
    customers_by_gender: customers.reduce((acc, c) => {
      acc[c.gender] = (acc[c.gender] || 0) + 1;
      return acc;
    }, {}),
    customers_by_membership: customers.reduce((acc, c) => {
      acc[c.membership_level] = (acc[c.membership_level] || 0) + 1;
      return acc;
    }, {}),
    average_age: customers.reduce((sum, c) => sum + c.age, 0) / customers.length,
    total_revenue: purchases.reduce((sum, p) => sum + p.total_amount, 0),
  };

  const reportPath = path.join(OUTPUT_DIR, 'generation_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📋 生成报告已保存: ${reportPath}`);

  console.log('\n🎉 模拟数据生成完成！');
}

// 执行主函数
main().catch(console.error);