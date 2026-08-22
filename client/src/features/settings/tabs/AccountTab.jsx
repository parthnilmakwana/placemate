import React from 'react';
import Button from '../../../components/Button';

function AccountTab() {
  const inputClass = "w-full px-4 py-3 rounded-md bg-brand-bg border border-brand-border text-text-main placeholder-slate-600 text-sm focus:border-white focus:outline-none transition-colors";
  const labelClass = "text-xs font-semibold text-text-secondary uppercase tracking-widest";

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="flex flex-col gap-1.5 border-b border-brand-border pb-4">
        <h2 className="font-heading text-2xl font-bold text-text-main">Account Information</h2>
        <p className="text-xs text-text-muted">
          Update your basic account details and email address.
        </p>
      </div>

      <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
        <div className="structured-panel rounded-lg overflow-hidden border border-brand-border p-6 flex flex-col gap-5 bg-brand-surface">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className={labelClass}>First Name</label>
              <input type="text" placeholder="John" className={inputClass} defaultValue="Parth" />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Last Name</label>
              <input type="text" placeholder="Doe" className={inputClass} defaultValue="Makwana" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className={labelClass}>Email Address</label>
            <input type="email" placeholder="john@example.com" className={inputClass} defaultValue="parth@example.com" />
            <p className="text-[11px] text-text-disabled mt-1">We will send an verification email if you change this.</p>
          </div>
          
        </div>

        <div className="flex justify-end mt-2">
          <Button type="submit" variant="primary">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AccountTab;
