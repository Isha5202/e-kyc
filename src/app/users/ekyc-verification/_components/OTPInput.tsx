'use client';

import InputGroup from '@/components/FormElements/InputGroup';

type Props = {
  otp: string;
  setOtp: (val: string) => void;
};

const OTPInput = ({ otp, setOtp }: Props) => (
  <InputGroup
    label="OTP"
    type="text"
    placeholder="Enter OTP"
    value={otp}
    handleChange={(e) => setOtp(e.target.value)}
    className="w-full mt-4"
  />
);

export default OTPInput;
