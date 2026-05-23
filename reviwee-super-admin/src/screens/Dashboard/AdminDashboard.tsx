
const AdminDashboard = () => {
  const name = localStorage.getItem("userName");
  return (
    <div className="space-y-6 p-3 md:p-5">
      <section className="rounded-2xl bg-gradient-to-r from-[var(--primary-main)] to-[#00a6cc] p-5 text-white shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome, {name}</h1>
     
      </section>

    </div>
  );
};

export default AdminDashboard;
