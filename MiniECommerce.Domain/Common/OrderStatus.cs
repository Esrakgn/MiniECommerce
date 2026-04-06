namespace MiniECommerce.Domain.Common;

public enum OrderStatus
{
    SiparisAlindi = 1,
    IptalEdildi = 2
}

// sipariş durumunu tanımlayan enum
//Yani sipariş artık sadece tarih ve toplam tutar taşımayacak, bir de durumu olacak.