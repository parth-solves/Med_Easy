import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AuditLogEntry } from '../types';
import {
  History,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Shield,
  Layers,
  FileCode,
  CheckCircle2,
} from 'lucide-react';

export const AuditView: React.FC = () => {
  const { auditLogs } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [inspectedEvent, setInspectedEvent] = useState<AuditLogEntry | null>(null);

  const actionTypes = Array.from(new Set(auditLogs.map((l) => l.action)));

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'ALL' || log.actorRole === selectedRole;
    const matchesAction = selectedAction === 'ALL' || log.action === selectedAction;
    return matchesSearch && matchesRole && matchesAction;
  });

  const handleExportCsv = () => {
    const headers = ['Timestamp', 'Action', 'Actor Name', 'Role', 'Entity Type', 'Entity ID', 'IP Address'];
    const rows = filteredLogs.map((l) => [
      l.timestamp,
      l.action,
      `"${l.actorName}"`,
      l.actorRole,
      l.entityType,
      l.entityId,
      l.ipAddress,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MedLink_Audit_Log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Immutable Regulatory Audit Ledger
            </h1>
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full font-mono">
              Append-Only • Cryptographically Indexed
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete tamper-evident trace of all authentication events, GST validations, drug licence reviews, invoice OCR parsing, and QR scans.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-xs font-semibold transition-colors shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-teal-400" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by action, actor, entity ID, or type..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="text-xs border border-slate-300 rounded-md px-2.5 py-2 bg-white focus:ring-1 focus:ring-teal-500"
          >
            <option value="ALL">All Roles</option>
            <option value="RETAIL_PHARMACY">Retail Pharmacy</option>
            <option value="WHOLESALE_DISTRIBUTOR">Wholesale Distributor</option>
            <option value="COMPLIANCE_REVIEWER">Compliance Reviewer</option>
            <option value="AUDITOR">Auditor</option>
            <option value="PLATFORM_ADMIN">Platform Admin</option>
          </select>

          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="text-xs border border-slate-300 rounded-md px-2.5 py-2 bg-white focus:ring-1 focus:ring-teal-500"
          >
            <option value="ALL">All Actions</option>
            {actionTypes.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-900">{filteredLogs.length}</strong> recorded audit events
          </span>
          <span className="font-mono text-[11px]">Storage Engine: LocalStorage + PostgreSQL Synced</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Timestamp (UTC)</th>
                <th className="py-2.5 px-3">Action Event</th>
                <th className="py-2.5 px-3">Actor / Entity</th>
                <th className="py-2.5 px-3">Target Entity</th>
                <th className="py-2.5 px-3">Inspect Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono font-bold text-slate-900 text-xs bg-slate-100 px-2 py-0.5 rounded">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-800">{log.actorName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {log.actorRole} • {log.ipAddress}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-slate-800 font-medium">{log.entityType}</div>
                    <div className="text-[10px] font-mono text-slate-400 truncate max-w-xs">
                      ID: {log.entityId}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => setInspectedEvent(log)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 rounded border border-slate-200 text-[11px] font-mono transition-colors"
                    >
                      View JSON
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: JSON Payload Inspector */}
      {inspectedEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Audit Payload: {inspectedEvent.action}
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">Event ID: {inspectedEvent.id}</p>
              </div>
              <button
                onClick={() => setInspectedEvent(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-lg text-slate-700">
                <div>Actor: <strong className="text-slate-900">{inspectedEvent.actorName}</strong></div>
                <div>Role: <span className="font-mono">{inspectedEvent.actorRole}</span></div>
                <div>Entity: <strong className="text-slate-900">{inspectedEvent.entityType}</strong></div>
                <div>IP: <span className="font-mono">{inspectedEvent.ipAddress}</span></div>
              </div>

              <div>
                <span className="font-semibold text-slate-700 block mb-1">Metadata JSON:</span>
                <pre className="p-3 bg-slate-900 text-teal-300 font-mono text-[11px] rounded-lg overflow-x-auto max-h-56">
                  {JSON.stringify(inspectedEvent.metadata, null, 2)}
                </pre>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setInspectedEvent(null)}
                  className="px-4 py-2 bg-slate-800 text-white rounded text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
