"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useShoppingCart } from "@/hooks/useShoppingCart"
import { formatCurrency } from "@/lib/utils"
import { ShoppingCart, Minus, Plus, Trash2, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart, totalItems, totalPrice } = useShoppingCart()

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Start shopping to add items to your cart</p>
            <Button asChild>
              <Link href="/shopping">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <p className="text-muted-foreground mt-1">
            {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/shopping">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Cart Items</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCart}
                  className="text-destructive hover:text-destructive bg-transparent"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Cart
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted">
                    <Image
                      src={item.product.imageUrl || "/placeholder.svg"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm line-clamp-2">{item.product.name}</h3>
                    <p className="text-xs text-muted-foreground">{item.product.brand}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold">{formatCurrency(item.product.price)}</span>
                      <Badge variant="outline" className="text-xs">
                        {item.product.retailer}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 bg-transparent"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 bg-transparent"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>

                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(item.product.price * item.quantity)}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-destructive hover:text-destructive mt-1"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>{formatCurrency(totalPrice * 0.08)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(totalPrice * 1.08)}</span>
                </div>
              </div>

              <Button className="w-full" size="lg">
                Proceed to Checkout
              </Button>

              <div className="text-center">
                <p className="text-xs text-muted-foreground">Secure checkout powered by Stripe</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <h4 className="font-medium text-sm">🌱 Farm to Cart Promise</h4>
                <p className="text-xs text-muted-foreground">
                  Every purchase supports sustainable farming and helps grow your virtual crops into real-world impact.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
