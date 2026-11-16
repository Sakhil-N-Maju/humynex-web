-- Courier tracking link on orders, shown to the customer.
ALTER TABLE "Order" ADD COLUMN "trackingUrl" TEXT;

-- Rental requests now start as enquiries the team approves.
ALTER TABLE "RentalBooking" ALTER COLUMN "status" SET DEFAULT 'ENQUIRY';
