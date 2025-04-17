import Image from 'next/image';
import Login from '@/components/Auth/Login';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-[500px] bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-center items-center">
          <Image
            src="/images/logo/namcobank-logo.svg"
            alt="Namco Bank Logo"
            width={150}
            height={45}
            priority
          />
        </div>
        <Login />
      </div>
    </div>
  );
}
