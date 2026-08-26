import { dbStore } from "@/lib/dbStore";
import { ShoppingBag, MapPin, Phone, Printer, Copy, Check } from "lucide-react";
import Link from "next/link";

// Using a Client Component for the buttons inside a Server Component wrapper
import { InvoiceActions } from "./InvoiceActions";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await dbStore.getOrderWithRelations(id);

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-[#DC2626] font-bold text-xl">Invoice Not Found</p>
        <Link href="/" className="px-6 py-2 bg-[#FAFAFA] border border-[#DC2626]/30 hover:bg-white rounded-lg text-[#000000] font-bold transition-colors">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#000000] font-sans py-12 px-4 print:p-0 print:bg-white flex flex-col items-center">
      <style>{`
        @media print {
          @page {
            margin: 10mm;
          }
          body {
            background-color: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
      
      {/* Top Navigation / Action Bar (Hidden when printing) */}
      <div className="w-full max-w-3xl flex justify-end items-center mb-8 print:hidden gap-4">
        <InvoiceActions />
      </div>

      {/* The Invoice Document */}
      <div className="w-full max-w-3xl bg-white border border-[#DC2626]/30 rounded-2xl shadow-xl print:shadow-none print:border-none print:rounded-none overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-[#ffffff] border-b border-[#e5e5e5] p-8 sm:p-12 print:p-6 flex flex-col items-center text-center relative">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#DC2626] via-[#DC2626] to-[#DC2626]" />
          <div className="w-24 h-24 flex items-center justify-center mb-3">
            <img src="/logo.png" alt="VINAYAKA MEDICALS Logo" className="max-w-full max-h-full object-contain" />
          </div>
          <h1 className="text-3xl font-black text-[#DC2626] tracking-tight">VINAYAKA MEDICALS</h1>
          <p className="text-xs text-[#DC2626] font-bold tracking-wider mt-1 mb-1">All Medicines & Surgical Items Available</p>
          <p className="text-xs text-[#DC2626] font-bold tracking-wider mb-4">INVOICE: {order.id}</p>

          <div className="flex flex-col items-center gap-2 text-sm text-[#333333] font-semibold">
            <div className="text-center max-w-md leading-relaxed">
              <span className="inline-block text-[#DC2626] mr-1.5 align-middle -mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
              </span>
              <span>Near Masaniamman Temple West Entrance, Anaimalai</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center">
              <Phone className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
              <span>+91 73390 40439 / +91 96266 80930</span>
            </div>
          </div>
        </div>

        {/* Invoice Meta Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 p-8 sm:p-12 print:p-6 border-b border-[#e5e5e5]/50">
          <div>
            <h3 className="text-[10px] font-bold text-[#666666] uppercase tracking-[0.2em] mb-3">Billed To</h3>
            <p className="text-base font-bold text-[#DC2626]">{order.customer_name || "Guest Customer"}</p>
            {order.customer_phone && (
              <p className="text-sm text-[#555555] font-semibold mt-1">+91 {order.customer_phone}</p>
            )}
          </div>
          <div className="sm:text-right flex flex-col sm:items-end">
            <h3 className="text-[10px] font-bold text-[#666666] uppercase tracking-[0.2em] mb-3 self-start sm:self-auto">Order Details</h3>
            <div className="inline-block text-left text-sm space-y-1">
              <div className="flex gap-2">
                <span className="text-[#666666] font-bold w-12 text-left sm:text-right">Date:</span>
                <span className="text-[#000000] font-black">{new Date(order.bill_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[#666666] font-bold w-12 text-left sm:text-right">Time:</span>
                <span className="text-[#000000] font-black">{new Date(order.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[#666666] font-bold w-12 text-left sm:text-right">Type:</span>
                <span className="text-[#000000] font-black uppercase">{order.source} SALE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="p-8 sm:p-12 print:py-4 print:px-6">
          <div className="w-full overflow-x-auto scrollbar-thin pb-2">
            <table className="w-full text-left border-collapse min-w-[400px]">
              <thead>
                <tr className="border-b-2 border-[#DC2626]/30">
                  <th className="py-4 text-[11px] font-bold text-[#666666] uppercase tracking-wider">Item Description</th>
                  <th className="py-4 text-[11px] font-bold text-[#666666] uppercase tracking-wider text-center">Qty</th>
                  <th className="py-4 text-[11px] font-bold text-[#666666] uppercase tracking-wider text-right">Price</th>
                  <th className="py-4 text-[11px] font-bold text-[#666666] uppercase tracking-wider text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5e5]/40">
                {order.items.map((item, index: number) => (
                  <tr key={index} className="group">
                    <td className="py-6 pr-4 print:py-3">
                      <p className="text-sm font-bold text-[#DC2626]">{item.snapshot_name}</p>
                    </td>
                    <td className="py-6 px-4 print:py-3 text-center text-sm font-bold text-[#000000]">{item.quantity}</td>
                    <td className="py-6 pl-4 print:py-3 text-right text-sm font-bold text-[#000000]">₹{Number(item.snapshot_price).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td className="py-6 pl-4 print:py-3 text-right text-sm font-black text-[#DC2626]">₹{(Number(item.snapshot_price) * item.quantity).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals Section */}
        <div className="bg-[#ffffff] border-t border-[#e5e5e5] p-8 sm:p-12 print:p-6 flex justify-end">

            {/* Calculations */}
            <div className="w-full sm:w-1/2 space-y-3">
              {(Number(order.discount_amount) > 0 || Number(order.delivery_fee) > 0 || Number(order.gst_amount) > 0) && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#666666] font-bold uppercase tracking-wider">Subtotal</span>
                  <span className="font-bold text-[#000000]">₹{Number(order.subtotal).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
              )}
              
              {Number(order.discount_amount) > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#666666] font-bold uppercase tracking-wider">
                    Discount {order.discount_type === 'PERCENT' ? `(${order.discount_value}%)` : ''}
                  </span>
                  <span className="font-bold text-[#E11D48]">-₹{Number(order.discount_amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
              )}

              {Number(order.gst_amount) > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#666666] font-bold uppercase tracking-wider">
                    GST ({order.gst_percentage}%)
                  </span>
                  <span className="font-bold text-[#000000]">₹{Number(order.gst_amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
              )}

              {Number(order.delivery_fee) > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#666666] font-bold uppercase tracking-wider">Delivery Fee</span>
                  <span className="font-bold text-[#000000]">₹{Number(order.delivery_fee).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
              )}

              <div className="border-t border-[#DC2626]/30 pt-4 mt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-2">
                <span className="text-sm font-black text-[#DC2626] uppercase tracking-widest shrink-0">Total Amount</span>
                <span className="text-3xl font-black text-[#DC2626] self-end sm:self-auto leading-none mt-1 sm:mt-0">
                  ₹{Number(order.grand_total).toLocaleString(undefined, {minimumFractionDigits: 2})}
                </span>
              </div>
            </div>
        </div>
        {/* Footer */}
        <div className="border-t border-[#e5e5e5]/60 p-6 print:p-4 text-center bg-[#fafafa] flex flex-col items-center justify-center gap-1.5">
          <p className="text-xs font-bold text-[#DC2626] tracking-wider uppercase">Thank you for shopping!</p>
          <p className="text-[9px] font-bold text-[#666666]/80 uppercase tracking-[0.15em]">Powered by Cenexa Systems @2026</p>
        </div>

      </div>
    </div>
  );
}
