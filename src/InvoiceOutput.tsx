import React from 'react';

interface InvoiceItem {
    name: string;
    quantity: number;
    price: number;
}

interface InvoiceOutputProps {
    issueDate: string;
    dueDate: string;
    recipient: string;
    senderName: string;
    senderPhone: string;
    senderAddress: string;
    items: InvoiceItem[];
    taxRate: number;
    bankInfo: string;
    notes: string;
    subtotal: number;
    tax: number;
    total: number;
}

const InvoiceOutput: React.FC<InvoiceOutputProps> = ({
    issueDate,
    dueDate,
    recipient,
    senderName,
    senderPhone,
    senderAddress,
    items,
    taxRate,
    bankInfo,
    notes,
    subtotal,
    tax,
    total,
}) => {
    return (
        <div
            className="w-[210mm] h-[297mm] p-12 bg-custom-white text-custom-gray-800"
            style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
        >
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-custom-primary">
                        請求書
                    </h1>
                    <p className="mt-4">{recipient}</p>
                </div>
                <div className="text-right">
                    <p>発行日: {issueDate}</p>
                    <p>支払期限: {dueDate}</p>
                    <div className="mt-4">
                        <p className="font-bold text-custom-primary">
                            {senderName}
                        </p>
                        <p>{senderAddress}</p>
                        <p>Tel: {senderPhone}</p>
                    </div>
                </div>
            </div>

            <div className="mt-12">
                <table className="w-full text-left">
                    <thead>
                        <tr>
                            <th className="py-2 border-b-2 border-custom-gray-300 text-custom-primary">
                                品名
                            </th>
                            <th className="py-2 border-b-2 border-custom-gray-300 text-right text-custom-primary">
                                数量
                            </th>
                            <th className="py-2 border-b-2 border-custom-gray-300 text-right text-custom-primary">
                                単価
                            </th>
                            <th className="py-2 border-b-2 border-custom-gray-300 text-right text-custom-primary">
                                金額
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td className="py-2 border-b border-custom-gray-200">
                                    {item.name}
                                </td>
                                <td className="py-2 border-b border-custom-gray-200 text-right">
                                    {item.quantity || ""}
                                </td>
                                <td className="py-2 border-b border-custom-gray-200 text-right">
                                    {item.price
                                        ? `¥${item.price.toLocaleString()}`
                                        : ""}
                                </td>
                                <td className="py-2 border-b border-custom-gray-200 text-right">
                                    {item.quantity * item.price
                                        ? `¥${(
                                              item.quantity * item.price
                                          ).toLocaleString()}`
                                        : ""}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 flex justify-end">
                <div className="w-1/3">
                    <div className="flex justify-between">
                        <p>小計</p>
                        <p>¥{subtotal.toLocaleString()}</p>
                    </div>
                    <div className="flex justify-between mt-2">
                        <p>消費税 ({taxRate}%)</p>
                        <p>¥{tax.toLocaleString()}</p>
                    </div>
                    <div className="flex justify-between mt-4 font-bold text-lg border-t-2 pt-2 border-custom-primary text-custom-primary">
                        <p>合計</p>
                        <p>¥{total.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="mt-12">
                <h3 className="font-bold border-b-2 pb-1 border-custom-primary text-custom-primary">
                    お振込先
                </h3>
                <p className="mt-2 whitespace-pre-wrap">{bankInfo}</p>
            </div>

            <div className="mt-8">
                <h3 className="font-bold border-b-2 pb-1 border-custom-primary text-custom-primary">
                    備考
                </h3>
                <p className="mt-2 whitespace-pre-wrap">{notes}</p>
            </div>
        </div>
    );
};

export default InvoiceOutput;
