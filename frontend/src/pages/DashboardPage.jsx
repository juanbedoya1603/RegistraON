import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import Header from '../components/dashboard/Header';
import ScannerSection from '../components/dashboard/ScannerSection';
import RecentActivity from '../components/dashboard/RecentActivity';
import Sidebar from '../components/dashboard/Sidebar';
import ProductModal from '../components/dashboard/ProductModal';

const DashboardPage = ({ cedula, userName, setCedula, setView, showToast }) => {
    const [ean, setEan] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [history, setHistory] = useState([]);
    const [userTime, setUserTime] = useState(0);
    const [ranking, setRanking] = useState([]);
    const [brandList, setBrandList] = useState([]);
    const [productList, setProductList] = useState([]);
    const [noMeasureProducts, setNoMeasureProducts] = useState([]);
    const [form, setForm] = useState({ product: '', brand: '', char: '', value: '', unit: '', sales: 'UND' });
    const [isLoading, setIsLoading] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [showGuide, setShowGuide] = useState(false);
    const scannerRef = useRef(null);

    const returnFocus = () => {
        if (scannerRef.current) scannerRef.current.focus();
    };

    const handleScan = async (e) => {
        e.preventDefault();
        const isValidEan = /^[0-9]{5,14}$/.test(ean);

        if (!isValidEan) {
            showToast('EAN inválido. Use entre 5 y 14 números.', 'error');
            setEan('');
            returnFocus();
            return;
        }

        setIsValidating(true);
        try {
            const data = await api.scanEan(ean);
            if (data.status === "success" || data.message === "EAN libre") {
                setShowModal(true);
            } else {
                showToast(data.message, 'error', 10000);
                setEan('');
            }
        } catch (error) {
            showToast('Error de conexión con el servidor (Backend caído).', 'error');
            setEan('');
        } finally {
            setIsValidating(false);
        }
    };

    const generateFullName = () => {
        const parts = [];
        if (form.product) parts.push(form.product.toUpperCase());
        if (form.brand) parts.push(form.brand.toUpperCase());
        if (form.char) parts.push(form.char.toUpperCase());
        if (form.value) {
            parts.push('X');
            parts.push(form.value);
            if (form.unit) parts.push(form.unit.toUpperCase());
        }
        parts.push(form.sales.toUpperCase());
        return parts.join(' ').replace(/\s+/g, ' ');
    };

    const handleSave = async () => {
        if (!form.product || !form.brand) {
            showToast('Producto y Marca son obligatorios', 'error');
            return;
        }

        const isNoMeasure = noMeasureProducts.some(keyword => form.product.toUpperCase().includes(keyword));
        if (!isNoMeasure && (!form.value || !form.unit)) {
            showToast('El Contenido y la Unidad de Medida son OBLIGATORIOS.', 'error');
            return;
        }

        setIsLoading(true);
        const fullName = generateFullName();
        const payload = {
            ean: ean,
            fullName: fullName,
            numDocument: cedula,
            nmProduct: form.product?.toUpperCase(),
            nmBrand: form.brand?.toUpperCase(),
            nmCharacteristic: form.char?.toUpperCase(),
            nmContentValue: form.value?.toString(),
            nmContentUnit: form.unit?.toUpperCase(),
            nmSalesUnit: form.sales?.toUpperCase()
        };

        try {
            await api.saveProduct(payload);
            const newEntry = { ean, fullName, time: '+1 MIN', id: Date.now() };
            setHistory([newEntry, ...history].slice(0, 5));
            setUserTime(prev => prev + 1);

            setShowModal(false);
            setShowGuide(false);
            setEan('');
            setForm({ product: '', brand: '', char: '', value: '', unit: '', sales: 'UND' });
            showToast('¡Hallazgo guardado en BD! +1 Minuto ganado.', 'success');

            // Refetch data
            refreshData();
        } catch (error) {
            showToast(error.detail || 'Error al guardar en base de datos', 'error');
        } finally {
            setIsLoading(false);
            returnFocus();
        }
    };

    const refreshData = async () => {
        try {
            const [rankingData, statsData] = await Promise.all([
                api.getRanking(),
                api.getUserStats(cedula)
            ]);
            setRanking(rankingData);
            setUserTime(statsData.saldo);
            setHistory(statsData.history);
        } catch (e) {
            console.error("Error al refrescar datos:", e);
        }
    };

    const handleLogout = () => {
        setCedula('');
        setView('login');
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [rankingData, statsData, brandsData, productsData, exceptionsData] = await Promise.all([
                    api.getRanking(),
                    api.getUserStats(cedula),
                    api.getBrands(),
                    api.getBaseProducts(),
                    api.getNoMeasureProducts()
                ]);

                setRanking(rankingData);
                setUserTime(statsData.saldo);
                setHistory(statsData.history);
                setBrandList(brandsData.brands || []);
                setProductList(productsData.products || []);
                setNoMeasureProducts(exceptionsData.products || []);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [cedula]);

    useEffect(() => {
        if (!isValidating && !showModal) {
            const timer = setTimeout(() => {
                if (scannerRef.current) scannerRef.current.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isValidating, showModal]);


    const filteredProducts = form.product.length >= 2 
        ? productList.filter(p => p.toUpperCase().includes(form.product.toUpperCase())).slice(0, 50)
        : [];

    const isNoMeasure = noMeasureProducts.some(kw => form.product.toUpperCase().includes(kw));

    return (
        <div className="min-h-[100dvh] lg:h-[100dvh] w-full bg-[#0a0a0a] text-slate-200 flex flex-col lg:flex-row overflow-x-hidden lg:overflow-hidden">
            {/* AREA CENTRAL: ESCÁNER */}
            <main className="w-full lg:flex-1 flex flex-col relative order-1 lg:order-2 lg:h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoOTAsIDk0LCA5OCwgMC4wNykiLz48L3N2Zz4=')]">
                
                <Header userName={userName} />

                <ScannerSection 
                    ean={ean} 
                    setEan={setEan} 
                    handleScan={handleScan} 
                    isValidating={isValidating} 
                    scannerRef={scannerRef} 
                />

                <RecentActivity history={history} />
                
            </main>

            <Sidebar 
                ranking={ranking} 
                userTime={userTime} 
                handleLogout={handleLogout} 
            />

            {/* MODAL (GLOBAL) */}
            {showModal && (
                <ProductModal 
                    showGuide={showGuide}
                    setShowGuide={setShowGuide}
                    setShowModal={setShowModal}
                    ean={ean}
                    form={form}
                    setForm={setForm}
                    filteredProducts={filteredProducts}
                    brandList={brandList}
                    isNoMeasure={isNoMeasure}
                    generateFullName={generateFullName}
                    handleSave={handleSave}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
};

export default DashboardPage;
