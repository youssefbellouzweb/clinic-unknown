export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 mt-auto">
            <div className="container-custom py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h4 className="text-white font-semibold mb-4">ClinicHub</h4>
                        <p className="text-sm">
                            Modern clinic management platform for healthcare providers.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="/clinics" className="hover:text-white transition-colors">Browse Clinics</a></li>
                            <li><a href="/login" className="hover:text-white transition-colors">Login</a></li>
                            <li><a href="/register" className="hover:text-white transition-colors">Register Clinic</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Contact</h4>
                        <p className="text-sm">
                            Email: support@clinichub.com<br />
                            Phone: (555) 123-4567
                        </p>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
                    <p>&copy; 2025 ClinicHub. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
