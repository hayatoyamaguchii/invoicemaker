import React, { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import InvoiceOutput from "./InvoiceOutput";

interface InvoiceItem {
    name: string;
    quantity: number;
    price: number;
}

const App: React.FC = () => {
    const getFormattedDate = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${year}年${month}月${day}日`;
    };

    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);

    const [issueDate, setIssueDate] = useState(getFormattedDate(today));
    const [dueDate, setDueDate] = useState(getFormattedDate(thirtyDaysLater));
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
    const [previewScale, setPreviewScale] = useState(1);

    useEffect(() => {
        const calculateScale = () => {
            if (invoiceRef.current) {
                const invoiceElement = invoiceRef.current;
                const parentContainer = invoiceElement.parentElement;

                if (!parentContainer) return;

                // 親コンテナの利用可能な幅からパディングを引く
                const PADDING_PX = 32; // p-8 は 32px のパディング
                const availableWidthPx = parentContainer.clientWidth - (PADDING_PX * 2);

                // A4用紙の幅をピクセルで近似 (210mm * 96dpi / 25.4mm/inch)
                const A4_WIDTH_PX_AT_96DPI = 793.7;

                if (availableWidthPx < A4_WIDTH_PX_AT_96DPI) {
                    const scale = availableWidthPx / A4_WIDTH_PX_AT_96DPI;
                    setPreviewScale(scale);
                } else {
                    setPreviewScale(1);
                }
            }
        };

        calculateScale(); // 初期計算
        window.addEventListener('resize', calculateScale);
        return () => window.removeEventListener('resize', calculateScale);
    }, []);

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
            html2canvas(invoiceElement, {
                backgroundColor: "#ffffff",
                scale: 3, // 高解像度でキャプチャ
            })
                .then((canvas) => {
                    const link = document.createElement("a");
                    link.href = canvas.toDataURL("image/png");
                    link.download = "invoice.png";
                    link.click();
                });
        }
    };

    const downloadPDF = () => {
        const invoiceElement = invoiceRef.current;
        if (invoiceElement) {
            html2canvas(invoiceElement, {
                scale: 3, // 高解像度でキャプチャ
                backgroundColor: "#ffffff",
            })
                .then((canvas) => {
                    const imgData = canvas.toDataURL("image/png");
                    const pdf = new jsPDF("p", "mm", "a4");

                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();

                    const imgWidth = canvas.width;
                    const imgHeight = canvas.height;

                    const imgAspectRatio = imgWidth / imgHeight;
                    const pdfAspectRatio = pdfWidth / pdfHeight;

                    let finalImgWidth;
                    let finalImgHeight;

                    if (imgAspectRatio > pdfAspectRatio) {
                        // 画像がPDFページより横長の場合、幅に合わせて調整
                        finalImgWidth = pdfWidth;
                        finalImgHeight = pdfWidth / imgAspectRatio;
                    } else {
                        // 画像がPDFページより縦長の場合、高さに合わせて調整
                        finalImgHeight = pdfHeight;
                        finalImgWidth = pdfHeight * imgAspectRatio;
                    }

                    // 画像を中央に配置
                    const xOffset = (pdfWidth - finalImgWidth) / 2;
                    const yOffset = (pdfHeight - finalImgHeight) / 2;

                    pdf.addImage(imgData, "PNG", xOffset, yOffset, finalImgWidth, finalImgHeight);
                    pdf.save("invoice.pdf");
                });
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-screen bg-custom-gray-200 text-custom-gray-800">
            <div className="w-full lg:w-1/2 p-8 overflow-y-auto bg-custom-white">
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
            <div className="w-full lg:w-1/2 p-8 bg-custom-gray-100 flex justify-center items-start overflow-y-auto overflow-x-hidden">
                <div
                    ref={invoiceRef}
                    style={{
                        transform: `scale(${previewScale})`,
                        transformOrigin: 'top center',
                        width: '210mm',
                        height: '297mm',
                        margin: previewScale < 1 ? '0 auto' : '0',
                    }}
                >
                    <InvoiceOutput
                        issueDate={issueDate}
                        dueDate={dueDate}
                        recipient={recipient}
                        senderName={senderName}
                        senderPhone={senderPhone}
                        senderAddress={senderAddress}
                        items={items}
                        taxRate={taxRate}
                        bankInfo={bankInfo}
                        notes={notes}
                        subtotal={subtotal}
                        tax={tax}
                        total={total}
                    />
                </div>
            </div>
        </div>
    );
};

export default App;
