import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import mongoose from "mongoose";
import { Customer, ICustomer } from "../models/Customer";
import { Order, IOrder } from "../models/Order";
import { connectDB } from "../lib/db";

const daysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const customersData: Partial<ICustomer>[] = [
  { name: "John Doe", email: "john.doe@email.com", phone: "+1-555-0101" },
  { name: "Sarah Smith", email: "sarah.smith@email.com", phone: "+1-555-0102" },
  { name: "Rahul Kumar", email: "rahul.kumar@email.com", phone: "+1-555-0103" },
  { name: "Emily Johnson", email: "emily.johnson@email.com", phone: "+1-555-0104" },
  { name: "Michael Brown", email: "michael.brown@email.com", phone: "+1-555-0105" },
  { name: "Priya Sharma", email: "priya.sharma@email.com", phone: "+1-555-0106" },
  { name: "David Wilson", email: "david.wilson@email.com", phone: "+1-555-0107" },
  { name: "Lisa Anderson", email: "lisa.anderson@email.com", phone: "+1-555-0108" },
  { name: "James Taylor", email: "james.taylor@email.com", phone: "+1-555-0109" },
  { name: "Maria Garcia", email: "maria.garcia@email.com", phone: "+1-555-0110" },
  { name: "Robert Martinez", email: "robert.martinez@email.com", phone: "+1-555-0111" },
  { name: "Jennifer Lee", email: "jennifer.lee@email.com", phone: "+1-555-0112" },
  { name: "William Thompson", email: "william.thompson@email.com", phone: "+1-555-0113" },
  { name: "Amanda White", email: "amanda.white@email.com", phone: "+1-555-0114" },
  { name: "Christopher Harris", email: "chris.harris@email.com", phone: "+1-555-0115" },
];

const ordersData: Partial<IOrder>[] = [
  {
    orderId: "ORD-1001",
    productName: "Wireless Headphones",
    amount: 149.99,
    orderDate: daysAgo(12),
    deliveryDate: daysAgo(5),
    status: "DELIVERED",
    refundable: true,
    refundStatus: "NONE",
  },
  {
    orderId: "ORD-1002",
    productName: "Smart Watch",
    amount: 299.99,
    orderDate: daysAgo(52),
    deliveryDate: daysAgo(45),
    status: "DELIVERED",
    refundable: true,
    refundStatus: "NONE",
  },
  {
    orderId: "ORD-1003",
    productName: "Digital Download - Software License",
    amount: 79.99,
    orderDate: daysAgo(10),
    deliveryDate: daysAgo(10),
    status: "DELIVERED",
    refundable: false,
    refundStatus: "NONE",
  },
  {
    orderId: "ORD-1004",
    productName: "Bluetooth Speaker",
    amount: 89.99,
    orderDate: daysAgo(20),
    deliveryDate: daysAgo(15),
    status: "DELIVERED",
    refundable: true,
    refundStatus: "REFUNDED",
  },
  {
    orderId: "ORD-1005",
    productName: "Gaming Mouse",
    amount: 69.99,
    orderDate: daysAgo(3),
    deliveryDate: daysAgo(3),
    status: "CANCELLED",
    refundable: true,
    refundStatus: "NONE",
  },
  {
    orderId: "ORD-1006",
    productName: "Mechanical Keyboard",
    amount: 129.99,
    orderDate: daysAgo(17),
    deliveryDate: daysAgo(10),
    status: "DELIVERED",
    refundable: true,
    refundStatus: "NONE",
  },
  {
    orderId: "ORD-1007",
    productName: "USB-C Hub",
    amount: 49.99,
    orderDate: daysAgo(67),
    deliveryDate: daysAgo(60),
    status: "DELIVERED",
    refundable: true,
    refundStatus: "NONE",
  },
  {
    orderId: "ORD-1008",
    productName: "Gift Card - $100",
    amount: 100,
    orderDate: daysAgo(5),
    deliveryDate: daysAgo(5),
    status: "DELIVERED",
    refundable: false,
    refundStatus: "NONE",
  },
  {
    orderId: "ORD-1009",
    productName: "Laptop Stand",
    amount: 59.99,
    orderDate: daysAgo(8),
    deliveryDate: daysAgo(3),
    status: "DELIVERED",
    refundable: true,
    refundStatus: "NONE",
  },
  {
    orderId: "ORD-1010",
    productName: "Webcam 4K",
    amount: 199.99,
    orderDate: daysAgo(25),
    deliveryDate: daysAgo(20),
    status: "DELIVERED",
    refundable: true,
    refundStatus: "REFUNDED",
  },
  {
    orderId: "ORD-1011",
    productName: 'Monitor 27"',
    amount: 349.99,
    orderDate: daysAgo(32),
    deliveryDate: daysAgo(25),
    status: "DELIVERED",
    refundable: true,
    refundStatus: "NONE",
  },
  {
    orderId: "ORD-1012",
    productName: "Desk Chair",
    amount: 249.99,
    orderDate: daysAgo(42),
    deliveryDate: daysAgo(35),
    status: "DELIVERED",
    refundable: true,
    refundStatus: "NONE",
  },
  {
    orderId: "ORD-1013",
    productName: "Custom Engraved Pen Set",
    amount: 89.99,
    orderDate: daysAgo(7),
    deliveryDate: daysAgo(7),
    status: "DELIVERED",
    refundable: false,
    refundStatus: "NONE",
  },
  {
    orderId: "ORD-1014",
    productName: "Phone Case",
    amount: 29.99,
    orderDate: daysAgo(4),
    deliveryDate: daysAgo(1),
    status: "DELIVERED",
    refundable: true,
    refundStatus: "NONE",
  },
  {
    orderId: "ORD-1015",
    productName: 'Tablet 10"',
    amount: 449.99,
    orderDate: daysAgo(2),
    deliveryDate: daysAgo(2),
    status: "CANCELLED",
    refundable: true,
    refundStatus: "NONE",
  },
];

async function seedDatabase() {
  try {
    await connectDB();

    await Customer.deleteMany({});
    await Order.deleteMany({});

    const customers = await Customer.insertMany(customersData);

    const orders = ordersData.map((order, index) => ({
      ...order,
      customerId: customers[index]._id,
    }));

    await Order.insertMany(orders);

    console.log(`Seeded ${customers.length} customers and ${orders.length} orders.`);
    console.log("Database seed completed successfully.");

    await mongoose.disconnect();
  } catch (error) {
    console.error("Database seed failed:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedDatabase();