
export const verifyPaymentController = async (req, res) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: "Payment reference is required.",
      });
    }

    const response = await fetch(
      `${process.env.PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data.message || "Payment verification failed.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully.",
      data: data.data,
    });
  } catch (error) {
    console.error("Payment Verify Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};