import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Decrity Dashboard App
 */
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
function App() {
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("header", { className: "bg-white shadow-sm", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 py-4", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-2xl", children: "\uD83D\uDEE1\uFE0F" }), _jsx("h1", { className: "text-xl font-semibold text-gray-900", children: "Decrity" })] }) }) }), _jsx("main", { className: "max-w-7xl mx-auto px-4 py-8", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/history", element: _jsx(History, {}) })] }) })] }));
}
export default App;
//# sourceMappingURL=App.js.map