import React, { useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface InvoiceItem {
    name: string;
    quantity: number;
    price: number;
}

const App: React.FC = () => {
    const [issueDate, setIssueDate] = useState("2050年5月23日");
    const [dueDate, setDueDate] = useState("2050年6月30日");
    const [recipient, setRecipient] = useState("宛名 様");
    const [senderName, setSenderName] = useState("差出人名");
    const [senderPhone, setSenderPhone] = useState("01-2345-6789");
    const [senderAddress, setSenderAddress] = useState("〒123-4567 ");
    const [items, setItems] = useState<InvoiceItem[]>(
        Array(10).fill({ name: "", quantity: 0, price: 0 })
    );
    const [taxRate, setTaxRate] = useState(10);
    const [bankInfo, setBankInfo] = useState("");
    const [notes, setNotes] = useState("");

    const invoiceRef = useRef<HTMLDivElement>(null);

    const handleItemChange = (
        index: number,
        field: keyof InvoiceItem,
        value: string | number
    ) => {
        const newItems = [...items];
        const currentItem = { ...newItems[index] };

        if (field === "name") {
            currentItem[field] = value as string;
        } else {
            const numValue = Number(value);
            if (!isNaN(numValue)) {
                currentItem[field] = numValue;
            }
        }
        newItems[index] = currentItem;
        setItems(newItems);
    };

    const subtotal = items.reduce(
        (acc, item) => acc + item.quantity * item.price,
        0
    );
    const tax = Math.floor(subtotal * (taxRate / 100));
    const total = subtotal + tax;

    const downloadPNG = () => {
        const invoiceElement = invoiceRef.current;
        if (invoiceElement) {
            invoiceElement.classList.remove("shadow-lg");

            html2canvas(invoiceElement, { backgroundColor: "#ffffff" })
                .then((canvas) => {
                    const link = document.createElement("a");
                    link.href = canvas.toDataURL("image/png");
                    link.download = "invoice.png";
                    link.click();
                })
                .finally(() => {
                    invoiceElement.classList.add("shadow-lg");
                });
        }
    };

    const downloadPDF = () => {
        const invoiceElement = invoiceRef.current;
        if (invoiceElement) {
            invoiceElement.classList.remove("shadow-lg");

            html2canvas(invoiceElement, {
                scale: 2,
                backgroundColor: "#ffffff",
            })
                .then((canvas) => {
                    const imgData = canvas.toDataURL("image/png");
                    const pdf = new jsPDF("p", "mm", "a4");
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const canvasWidth = canvas.width;
                    const canvasHeight = canvas.height;
                    const ratio = canvasWidth / canvasHeight;
                    const pdfHeight = pdfWidth / ratio;
                    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
                    pdf.save("invoice.pdf");
                })
                .finally(() => {
                    invoiceElement.classList.add("shadow-lg");
                });
        }
    };

    return (
        <div className="flex h-screen bg-custom-gray-200 text-custom-gray-800">
            <div className="w-1/2 p-8 overflow-y-auto bg-custom-white">
                <h2 className="text-2xl font-bold mb-6 text-custom-primary">
                    入力フォーム
                </h2>
                <div className="grid grid-cols-1 gap-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-custom-gray-700">
                                発行日
                            </label>
                            <input
                                type="text"
                                value={issueDate}
                                onChange={(e) => setIssueDate(e.target.value)}
                                className="mt-1 block w-full rounded-md border-custom-gray-300 shadow-sm focus:border-custom-accent focus:ring-custom-accent sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-custom-gray-700">
                                支払期限
                            </label>
                            <input
                                type="text"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="mt-1 block w-full rounded-md border-custom-gray-300 shadow-sm focus:border-custom-accent focus:ring-custom-accent sm:text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-custom-gray-700">
                            宛名
                        </label>
                        <input
                            type="text"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            className="mt-1 block w-full rounded-md border-custom-gray-300 shadow-sm focus:border-custom-accent focus:ring-custom-accent sm:text-sm"
                        />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-custom-primary">
                            請求元情報
                        </h3>
                        <div className="mt-4 grid grid-cols-1 gap-4">
                            <input
                                type="text"
                                placeholder="請求元氏名"
                                value={senderName}
                                onChange={(e) => setSenderName(e.target.value)}
                                className="block w-full rounded-md border-custom-gray-300 shadow-sm focus:border-custom-accent focus:ring-custom-accent sm:text-sm"
                            />
                            <input
                                type="text"
                                placeholder="電話番号"
                                value={senderPhone}
                                onChange={(e) => setSenderPhone(e.target.value)}
                                className="block w-full rounded-md border-custom-gray-300 shadow-sm focus:border-custom-accent focus:ring-custom-accent sm:text-sm"
                            />
                            <input
                                type="text"
                                placeholder="郵便番号・住所"
                                value={senderAddress}
                                onChange={(e) =>
                                    setSenderAddress(e.target.value)
                                }
                                className="block w-full rounded-md border-custom-gray-300 shadow-sm focus:border-custom-accent focus:ring-custom-accent sm:text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-custom-primary">
                            品目
                        </h3>
                        {items.map((item, index) => (
                            <div
                                key={index}
                                className="grid grid-cols-3 gap-4 mt-4"
                            >
                                <input
                                    type="text"
                                    placeholder="品名"
                                    value={item.name}
                                    onChange={(e) =>
                                        handleItemChange(
                                            index,
                                            "name",
                                            e.target.value
                                        )
                                    }
                                    className="col-span-1 block w-full rounded-md border-custom-gray-300 shadow-sm focus:border-custom-accent focus:ring-custom-accent sm:text-sm"
                                />
                                <input
                                    type="number"
                                    placeholder="数量"
                                    value={item.quantity}
                                    onChange={(e) =>
                                        handleItemChange(
                                            index,
                                            "quantity",
                                            e.target.value
                                        )
                                    }
                                    className="col-span-1 block w-full rounded-md border-custom-gray-300 shadow-sm focus:border-custom-accent focus:ring-custom-accent sm:text-sm"
                                />
                                <input
                                    type="number"
                                    placeholder="単価"
                                    value={item.price}
                                    onChange={(e) =>
                                        handleItemChange(
                                            index,
                                            "price",
                                            e.target.value
                                        )
                                    }
                                    className="col-span-1 block w-full rounded-md border-custom-gray-300 shadow-sm focus:border-custom-accent focus:ring-custom-accent sm:text-sm"
                                />
                            </div>
                        ))}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-custom-gray-700">
                            税率 (%)
                        </label>
                        <input
                            type="number"
                            value={taxRate}
                            onChange={(e) => setTaxRate(Number(e.target.value))}
                            className="mt-1 block w-full rounded-md border-custom-gray-300 shadow-sm focus:border-custom-accent focus:ring-custom-accent sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-custom-gray-700">
                            銀行情報
                        </label>
                        <textarea
                            value={bankInfo}
                            onChange={(e) => setBankInfo(e.target.value)}
                            className="mt-1 block w-full rounded-md border-custom-gray-300 shadow-sm focus:border-custom-accent focus:ring-custom-accent sm:text-sm"
                            rows={3}
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-custom-gray-700">
                            備考欄
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="mt-1 block w-full rounded-md border-custom-gray-300 shadow-sm focus:border-custom-accent focus:ring-custom-accent sm:text-sm"
                            rows={3}
                        ></textarea>
                    </div>
                </div>
                <div className="mt-8 flex justify-end space-x-4">
                    <button
                        onClick={downloadPNG}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-custom-white bg-custom-accent hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-accent"
                    >
                        PNGダウンロード
                    </button>
                    <button
                        onClick={downloadPDF}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-custom-white bg-custom-secondary hover:bg-custom-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-secondary"
                    >
                        PDFダウンロード
                    </button>
                </div>
            </div>
            <div className="w-1/2 p-8 bg-custom-gray-100 flex justify-center items-start overflow-y-auto">
                <div
                    ref={invoiceRef}
                    className="w-[210mm] h-[297mm] p-12 bg-custom-white shadow-lg text-custom-gray-800"
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
            </div>
        </div>
    );
};

export default App;
