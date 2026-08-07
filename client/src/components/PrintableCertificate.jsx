import React, { forwardRef } from "react";

const PrintableCertificate = forwardRef(({ site }, ref) => {
  if (!site) return null;

  return (
    <div
      ref={ref}
      className="p-10 bg-white text-black font-sans w-full max-w-4xl mx-auto min-h-[100vh] flex flex-col"
    >
      {/* Header - Letter Pad Style */}
      <div className="flex justify-between border-b-2 border-slate-900 pb-6 mb-12">
        <div className="flex items-center gap-4">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="w-20 h-20 object-contain rounded-lg" 
            onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} 
          />
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Mona Interior Studio</h1>
            <p className="text-slate-600">Professional Interior Design Services</p>
          </div>
        </div>
        <div className="text-right flex flex-col justify-center">
          <h2 className="text-2xl font-bold uppercase text-slate-800 tracking-wide">Completion Certificate</h2>
          <p className="text-sm font-semibold text-slate-600 mt-2">Date: {new Date().toLocaleDateString("en-GB")}</p>
          {site.id && (
            <p className="text-xs font-bold text-slate-500 mt-1">Ref WO: {site.id}</p>
          )}
        </div>
      </div>

      {/* Certificate Body */}
      <div className="flex-1 flex flex-col items-center pt-10 px-8 text-center space-y-8">
        <h3 className="text-3xl font-serif text-slate-800 italic mb-8">To Whom It May Concern</h3>
        
        <p className="text-lg text-slate-700 leading-relaxed max-w-2xl">
          This is to officially certify that the interior design and execution project titled:
        </p>
        
        <p className="text-2xl font-bold text-slate-900 border-b-2 border-slate-200 pb-2 inline-block px-8">
          "{site.name}"
        </p>
        
        <div className="text-lg text-slate-700 leading-relaxed max-w-2xl mt-8">
          <p className="mb-2">undertaken for our esteemed client:</p>
          <p className="text-xl font-bold text-slate-900">{site.clientName || '________________________'}</p>
          {site.organizationName && (
            <p className="text-lg font-semibold text-slate-600">({site.organizationName})</p>
          )}
        </div>

        <div className="mt-12 p-6 bg-slate-50 rounded-xl border border-slate-100 max-w-3xl">
          <p className="text-lg font-semibold text-emerald-700 text-center uppercase tracking-wider mb-2">Declaration of Completion</p>
          <p className="text-md text-slate-700">
            All contracted works are finished according to the agreed specifications, and there are no pending works remaining for this project.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-gray-300 text-center">
        <p className="text-xs text-gray-500 italic font-medium">This is a computer generated document and does not require a physical signature.</p>
      </div>
    </div>
  );
});

export default PrintableCertificate;
