import EventDispatcher from "../../@shared/event/event-dispatcher";
import EnviaConsolelogHandler from "./handler/envia-consolelog.handler";
import EnviaConsolelog1Handler from "./handler/envia-consolelog1.handler";
import EnviaConsolelog2Handler from "./handler/envia-consolelog2.handler";
import CustomerFactory from "../factory/customer.factory";
import Address from "../value-object/address";
import CustomerCreatedEvent from "./customer-created.event";

describe("Customer Created Event Dispatcher Tests", () => {

	it("should register all handlers", () => {
		const eventDispatcher = new EventDispatcher();
		const eventHandler = new EnviaConsolelogHandler();
		const eventHandler1 = new EnviaConsolelog1Handler();
		const eventHandler2 = new EnviaConsolelog2Handler();

		eventDispatcher.register("CustomerCreatedEvent", eventHandler);
		eventDispatcher.register("CustomerCreatedEvent", eventHandler1);
		eventDispatcher.register("CustomerCreatedEvent", eventHandler2);

		expect(
			eventDispatcher.getEventHandlers["CustomerCreatedEvent"]
		).toBeDefined();
		expect(
			eventDispatcher.getEventHandlers["CustomerCreatedEvent"].length
		).toBe(3);
		expect(
			eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0]
		).toMatchObject(eventHandler);
		expect(
			eventDispatcher.getEventHandlers["CustomerCreatedEvent"][1]
		).toMatchObject(eventHandler1);
		expect(
			eventDispatcher.getEventHandlers["CustomerCreatedEvent"][2]
		).toMatchObject(eventHandler2);
	});

	it("should notify all event handlers", () => {
		const eventDispatcher = new EventDispatcher();
		const eventHandler = new EnviaConsolelogHandler();
    const spyEventHandler = jest.spyOn(eventHandler, "handle");
		const eventHandler1 = new EnviaConsolelog1Handler();
		const spyEventHandler1 = jest.spyOn(eventHandler1, "handle");
		const eventHandler2 = new EnviaConsolelog2Handler();
		const spyEventHandler2 = jest.spyOn(eventHandler2, "handle");

		eventDispatcher.register("CustomerCreatedEvent", eventHandler);
		eventDispatcher.register("CustomerCreatedEvent", eventHandler1);
		eventDispatcher.register("CustomerCreatedEvent", eventHandler2);
		const customer = CustomerFactory.createWithAddress(
			"Customer 01", 
			new Address("Street 01", 123, "234-234", "City1"))

		const customerCreatedEvent = new CustomerCreatedEvent(customer);
		eventDispatcher.notify(customerCreatedEvent)

		expect(spyEventHandler).toHaveBeenCalledTimes(1);
		expect(spyEventHandler).toHaveBeenCalledWith(customerCreatedEvent);
		expect(spyEventHandler1).toHaveBeenCalledTimes(1);
		expect(spyEventHandler1).toHaveBeenCalledWith(customerCreatedEvent);
		expect(spyEventHandler2).toHaveBeenCalledTimes(1);
		expect(spyEventHandler2).toHaveBeenCalledWith(customerCreatedEvent);

	});

});