import { Sequelize } from "sequelize-typescript";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import ProductModel from "../../../product/repository/sequelize/product.model";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepository from "./order.repository";

describe("Order repository test", () => {
  let sequelize: Sequelize;
  const orderRepository = new OrderRepository();
  const productRepository = new ProductRepository();

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a new order", async () => {
    
    const customer = await createCustomer();
    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", customer.id, [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: customer.id,
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          order_id: "123",
          product_id: "123",
        },
      ],
    });
  });

  it("should change item quantity", async () => {
    const orderItem = new OrderItem(
      "1",
      "Product 1",
      10,
      "123",
      2
    );
    orderItem.changeQuantity(3);
    expect(orderItem.quantity).toBe(3);
    expect(orderItem.total()).toBe(30);
  })

  it("should update an order", async () => {
    const customer = await createCustomer();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);
    const orderItem = new OrderItem("1", product.name, product.price, product.id, 2);
    const order = new Order("123", customer.id, [orderItem]);
    await orderRepository.create(order);
    
    // update the order
    orderItem.changeQuantity(3);
    order.updateOrderItem(orderItem);
    await orderRepository.update(order);

    // retrieve the order from the database
    const updatedOrderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(updatedOrderModel.toJSON()).toStrictEqual({
      id: order.id,
      customer_id: customer.id,
      total: 30,
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: 3,
          order_id: order.id,
          product_id: product.id,
        }
      ]
    });
  });

  it("should find an order", async () => {
    const customer = await createCustomer();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);
    const orderItem = new OrderItem("1", product.name, product.price, product.id, 2);
    const order = new Order("123", customer.id, [orderItem]);
    await orderRepository.create(order);

    const foundOrder = await orderRepository.find(order.id);

    expect(foundOrder).toStrictEqual(order);
  });

  it("should throw an error when order is not found", async () => {
    await expect(orderRepository.find("123")).rejects.toThrow("Order not found");
  });

  it("should find all orders", async () => {
    const customer = await createCustomer();
    const product1 = new Product("123", "Product 1", 10);
    await productRepository.create(product1);
    const product2 = new Product("456", "Product 2", 20);
    await productRepository.create(product2);

    const orderItem1 = new OrderItem("1", product1.name, product1.price, product1.id, 2);
    const order1 = new Order("123", customer.id, [orderItem1]);
    await orderRepository.create(order1);

    const orderItem2 = new OrderItem("2", product2.name, product2.price, product2.id, 4);
    const order2 = new Order("456", customer.id, [orderItem2]);
    await orderRepository.create(order2);

    const orders = await orderRepository.findAll();

    expect(orders.length).toBe(2);
    expect(orders[0]).toStrictEqual(order1);
    expect(orders[1]).toStrictEqual(order2);
  });
});
async function createCustomer (): Promise<Customer> {
  // create a customer
  const customerRepository = new CustomerRepository();
  const customer = new Customer("123", "Customer 1");
  const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
  customer.changeAddress(address);
  await customerRepository.create(customer);
  return customer;
}
