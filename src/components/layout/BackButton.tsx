import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate(-1)}
      className="mb-4 text-metal-light hover:text-primary hover:bg-transparent transition-all duration-300 group"
      aria-label="Go back"
    >
      <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform duration-300" />
      Back
    </Button>
  );
};

export default BackButton;




