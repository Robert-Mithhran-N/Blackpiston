import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Category } from "@/data/products";

interface CategoryCardProps {
  category: Category;
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  return (
    <Link to={`/shop/${category.id}`}>
      <Card className="group overflow-hidden border-border bg-card hover:border-primary/50 transition-all duration-300 h-full">
        <CardContent className="p-6 space-y-4 h-full flex flex-col">
          {/* Category Icon */}
          <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <div className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors">
              {/* Placeholder for icon */}
              <div className="w-full h-full bg-current opacity-20 rounded"></div>
            </div>
          </div>
          
          {/* Category Name */}
          <div className="flex-1">
            <h3 className="text-xl font-display tracking-wide text-foreground group-hover:text-primary transition-colors">
              {category.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              {category.products.length} products available
            </p>
          </div>
          
          {/* Arrow */}
          <div className="flex justify-end">
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CategoryCard;