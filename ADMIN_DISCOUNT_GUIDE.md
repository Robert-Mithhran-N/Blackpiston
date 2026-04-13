# Admin Guide: How to Create Top Offers

## Quick Start

Top Offers are now **automatic** - just set product discounts and they'll appear on the homepage!

---

## Step-by-Step: Add a Product to Top Offers

### 1. Go to Products Page
Navigate to: **Admin Panel → Products**

### 2. Edit or Create Product
- Click **Edit** on existing product, OR
- Click **Add New Product** button

### 3. Set Pricing
Fill in these fields:

```
Original Price: ₹5,000
Offer Price:    ₹3,500
```

**That's it!** The system automatically:
- Calculates discount: 30% OFF
- Ranks by highest discount
- Shows top 8 on homepage

---

## How Products Appear in Top Offers

### Automatic Ranking
Products are sorted by **discount percentage** (highest first):

| Product | Price | Offer Price | Discount | Rank |
|---------|-------|-------------|----------|------|
| Helmet A | ₹5,000 | ₹2,500 | **50% OFF** | 🥇 1st |
| Jacket B | ₹8,000 | ₹5,600 | **30% OFF** | 🥈 2nd |
| Gloves C | ₹2,000 | ₹1,600 | **20% OFF** | 🥉 3rd |

### Requirements
For a product to appear in Top Offers:
- ✅ `isActive` = true
- ✅ `inStock` = true
- ✅ `offerPrice` is set (not null)
- ✅ `offerPrice` < `price`

---

## Examples

### Example 1: Create 50% OFF Offer
```
Product: AGV K6 Helmet
Original Price: ₹45,999
Offer Price:    ₹22,999
Result: 50% OFF badge - appears as #1 Top Offer
```

### Example 2: Create 25% OFF Offer
```
Product: Alpinestars Jacket
Original Price: ₹12,000
Offer Price:    ₹9,000
Result: 25% OFF badge - appears in Top Offers
```

### Example 3: Remove from Top Offers
To remove a product from Top Offers:
- Set `Offer Price` to empty/null, OR
- Set `Offer Price` = `Original Price`, OR
- Set `isActive` = false

---

## Tips for Best Results

### 1. **Strategic Discounts**
- Use 30-50% discounts for maximum impact
- Rotate offers weekly/monthly
- Highlight seasonal products

### 2. **Stock Management**
- Ensure sufficient stock before offering discounts
- Out-of-stock products won't show in Top Offers

### 3. **Pricing Strategy**
```
Good:  ₹5,000 → ₹3,500 (30% OFF) ✅
Better: ₹5,000 → ₹2,500 (50% OFF) ✅✅
Avoid: ₹5,000 → ₹4,900 (2% OFF)  ❌ Too small
```

### 4. **Product Selection**
Best products for Top Offers:
- Popular items (helmets, jackets)
- High-margin products
- Seasonal clearance
- New arrivals (with launch discount)

---

## FAQ

### Q: How many products appear in Top Offers?
**A:** Top 8 products with highest discounts.

### Q: Can I manually choose which products appear?
**A:** No - it's automatic based on discount percentage. To prioritize a product, give it a higher discount.

### Q: How do I feature a specific product?
**A:** Set `isFeatured` = true in product settings. Featured products appear in a separate section.

### Q: Can I schedule offers (start/end dates)?
**A:** Not yet - coming in future update. For now, manually update offerPrice when needed.

### Q: What if two products have same discount?
**A:** They're sorted by creation date (newest first).

### Q: Do Top Offers update in real-time?
**A:** Yes! Changes to offerPrice reflect immediately on homepage (after page refresh).

---

## Common Scenarios

### Scenario 1: Flash Sale
```
1. Set high discount (40-60% OFF)
2. Product automatically appears in Top Offers
3. After sale ends, remove offerPrice
```

### Scenario 2: Clearance Sale
```
1. Filter products by old stock
2. Bulk edit: set offerPrice for all
3. All appear in Top Offers automatically
```

### Scenario 3: Category Sale (e.g., All Helmets)
```
1. Go to Products → Filter by "Helmets"
2. Edit each helmet, set offerPrice
3. Helmets dominate Top Offers section
```

---

## Monitoring Top Offers

### Check Current Top Offers
1. Visit homepage: `https://yoursite.com`
2. Scroll to "Top Offers" section
3. See which products are showing

### Verify Discount Calculation
```
Formula: ((Original Price - Offer Price) / Original Price) × 100

Example:
Original: ₹5,000
Offer:    ₹3,500
Discount: ((5000 - 3500) / 5000) × 100 = 30%
```

---

## Best Practices

### ✅ DO
- Update offers regularly (weekly/monthly)
- Use round numbers (₹2,999 → ₹1,999)
- Test on homepage after changes
- Monitor stock levels
- Rotate products to keep fresh

### ❌ DON'T
- Set tiny discounts (< 10%)
- Offer discounts on out-of-stock items
- Leave expired offers active
- Set offerPrice higher than price
- Forget to update after sale ends

---

## Quick Reference Card

```
┌─────────────────────────────────────────┐
│  HOW TO CREATE TOP OFFER                │
├─────────────────────────────────────────┤
│  1. Admin → Products                    │
│  2. Edit Product                        │
│  3. Set Original Price: ₹5,000          │
│  4. Set Offer Price:    ₹3,500          │
│  5. Save                                │
│                                         │
│  ✅ Done! Auto-appears on homepage      │
└─────────────────────────────────────────┘
```

---

## Need Help?

**Issue**: Product not showing in Top Offers  
**Check**:
- [ ] Is `isActive` = true?
- [ ] Is `inStock` = true?
- [ ] Is `offerPrice` set and < `price`?
- [ ] Are there 8+ products with higher discounts?

**Issue**: Wrong discount percentage  
**Solution**: Verify `price` and `offerPrice` values are correct.

**Issue**: Want to prioritize specific product  
**Solution**: Increase its discount percentage to rank higher.

---

**Last Updated**: 2026-04-13  
**System**: Dynamic Discount-Based Top Offers
