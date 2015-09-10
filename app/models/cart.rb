class Cart < ActiveRecord::Base
	resourcify
	belongs_to :user
	has_one :delivery_address, through: :cart_delivery_address
	has_one :cart_delivery_address
	has_many :order_items, through: :orders
	has_many :orders, dependent: :destroy
	before_save :update_total
	after_save :update_orders
	include AASM

	aasm do
	  state :not_started, :initial => true
	  state :purchased
	  state :ordered
	  state :dispatched
	  state :delivered

	  event :cancel do
	    transitions :from => :purchased, :to => :not_started
	  end

	  event :purchase do
	    transitions :from => :not_started, :to => :purchased
	  end

	  event :order do 
			transitions :from => :purchased, :to => :ordered
	  end

	  event :dispatch do 
	  	transitions :from => :ordered, :to => :dispatched
	  end

	  event :deliver do 
	  	transitions :from => :dispatched, :to => :delivered
	  end
	end

	def add_combo(combo_id, selected_dishes)
		combo = Combo.find combo_id
		current_orders = self.orders.where(product_id: combo_id)
		current_orders.each do |current_order|
			if current_order and check_with_incoming_order(current_order, selected_dishes, combo_id)
				current_order.quantity += 1
				return current_order if current_order.save!
			end
		end

		future_order = self.orders.build(product_id: combo_id, product_type: "Combo", total: combo.price)
		selected_dishes.each do |s_dish|
			if s_dish[:combo_id] == combo_id
				if s_dish[:combo_option_id].present?
					future_order.order_items.build(item_id: s_dish[:dish_id], item_type: "Dish", category_id: s_dish[:combo_option_id], category_type: "ComboOption")
				elsif s_dish[:combo_dish_id].present?
					future_order.order_items.build(item_id: s_dish[:dish_id], item_type: "Dish", category_id: s_dish[:combo_dish_id], category_type: "ComboDish")
				end
			end
		end
		return future_order if future_order.save!
	end

	def check_with_incoming_order(current_order, selected_dishes, combo_id)
		current_order_items_length = current_order.order_items.length
		counting_length = 0
		selected_dishes.each do |s_dish|
			current_order.order_items.each do |order_item|
				if order_item[:item_id] == s_dish[:dish_id] and (order_item[:category_id] == s_dish[:combo_option_id] or order_item[:category_id] == s_dish[:combo_dish_id]) and combo_id == s_dish[:combo_id]
					counting_length += 1
					break
				end
		  end
		end
		if counting_length == current_order_items_length
			return true
		else
			return false
		end
	end

	def add_combo_from_mobile(combo_info)
		combo = Combo.find combo_info[:id]
		current_orders = self.orders.where(product_id: combo.id)
		
		current_orders.each do |current_order|
			if current_order and check_with_incoming_order_for_mobile(current_order, combo_info)
				current_order.quantity += 1
				current_order.update_order_items
				return current_order if current_order.save!
			end
		end

		future_order = self.orders.build(product_id: combo.id, product_type: "Combo", total: combo.price)

		if combo_info[:combo_options].present?
			combo_info[:combo_options].each do |combo_option|
				future_order.order_items.build(item_id: combo_option[:dish][:id], item_type: "Dish", category_id: combo_option[:id], category_type: "ComboOption")
			end
		end

		if combo_info[:combo_dishes].present?
			combo_info[:combo_dishes].each do |combo_dish|
				future_order.order_items.build(item_id: combo_dish[:dish][:id], item_type: "Dish", category_id: combo_dish[:id], category_type: "ComboDish")
			end
		end

		return future_order if future_order.save!
	end

	def check_with_incoming_order_for_mobile(current_order, combo_info)
		current_order_items_length = current_order.order_items.length
		counting_length = 0

		if combo_info[:combo_options].present?
			combo_info[:combo_options].each do |combo_option|
				current_order.order_items.each do |order_item|
					if order_item[:item_id] == combo_option[:dish][:id] and order_item[:category_id] == combo_option[:id]
						counting_length += 1
						break
					end
				end
			end
		end
		
		if combo_info[:combo_dishes].present?
			combo_info[:combo_dishes].each do |combo_dish|
				current_order.order_items.each do |order_item|
					if order_item[:item_id] == combo_dish[:dish][:id] and order_item[:category_id] == combo_dish[:id]
						counting_length += 1
						break
					end
				end
			end
		end

		if counting_length == current_order_items_length
			return true
		else
			return false
		end
	end

	def remove_combo_from_mobile(combo_id)
		current_orders = self.orders.where(product_id: combo_id)
		if current_orders.present?
			current_orders.last.destroy!
		end
	end

	def update_total
		self.total = self.total_price
		return true
	end
	
	def total_price
		self.orders.to_a.sum {|order| order.total}
	end

	def update_orders
		if self.purchased?	
			self.orders.each {|order| order.product.update_attributes! no_of_purchases: order.quantity; order.order_items.each{|order_item| order_item.item.update_attributes! no_of_purchases: order_item.quantity} }
		end
		return true
	end

	def generate_order_id
		self.order_id = "OD" + Digest::SHA1.hexdigest(Time.now.to_s)[0..9]
		self.save!
	end
end
